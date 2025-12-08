import {
    Injectable,
    Inject,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { IRegistrationRepository } from '../../domain/repositories/registration.repository.interface';
import { Registration } from '../../domain/entities/registration.entity';
import { RegistrationStatus } from '../../domain/entities/registration-status.enum';
import { CreateRegistrationDto } from '../dto/create-registration.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ApplyForEventUseCase {
    private readonly logger = new Logger(ApplyForEventUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly amqp: AmqpConnection,
        private readonly configService: ConfigService
    ) { }

    async execute(
        dto: CreateRegistrationDto,
        userId: string,
        userName: string,
        userEmail: string,
        userPhone: string
    ): Promise<Registration> {
        this.logger.log(`User ${userId} applying for event ${dto.eventId}`);

        // 1. Check if user already registered for this event
        const existing = await this.registrationRepository.findExistingRegistration(
            dto.eventId,
            userId
        );

        if (existing && existing.isActive()) {
            throw new BadRequestException('You have already registered for this event');
        }

        // 2. Get event details from EVENT SERVICE
        const event = await this.getEventDetails(dto.eventId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // 3. Validate event status and registration deadline
        this.validateEventForRegistration(event);

        // 4. Validate role exists in event
        const role = event.roles.find((r: any) => r.id === dto.roleId);
        if (!role) {
            throw new BadRequestException('Role not found in event');
        }

        // 5. Check if role is full
        if (role.filled >= role.slots) {
            throw new BadRequestException(`Role "${role.name}" is full`);
        }

        // 6. Check if event is full
        if (event.capacity.currentVolunteers >= event.capacity.maxVolunteers) {
            throw new BadRequestException('Event is full');
        }

        // 7. Generate unique registration code (for QR check-in)
        const registrationCode = this.generateRegistrationCode();

        // 8. Create registration
        const registrationData = {
            registrationCode,
            eventId: dto.eventId,
            eventTitle: event.title,
            eventDate: new Date(event.schedule.startDate),
            eventLocation: `${event.location.address}, ${event.location.district}, ${event.location.city}`,
            organizerId: event.organizerId,
            organizerName: event.organizerName,
            organizerEmail: event.organizerEmail,
            volunteerId: userId,
            volunteerName: userName,
            volunteerEmail: userEmail,
            volunteerPhone: userPhone,
            roleId: dto.roleId,
            roleName: role.name,
            status: RegistrationStatus.PENDING,
            applicationForm: {
                motivation: dto.motivation,
                experience: dto.experience || '',
                skills: dto.skills,
                availability: dto.availability,
                emergencyContact: dto.emergencyContact,
            },
            approval: {},
            attendance: {},
            completion: {},
        };

        const registration = await this.registrationRepository.create(registrationData as any);

        // 9. Publish event to message bus
        await this.amqp.publish(
            'notification_exchange',
            'registration.submitted',
            {
                type: 'registration_submitted',
                userId: registration.organizerId,
                recipient: registration.organizerEmail,
                registrationId: registration.id,
                registrationCode: registration.registrationCode,
                eventId: registration.eventId,
                eventTitle: registration.eventTitle,
                volunteerId: registration.volunteerId,
                volunteerName: registration.volunteerName,
                volunteerEmail: registration.volunteerEmail,
                organizerId: registration.organizerId,
                organizerName: registration.organizerName,
                organizerEmail: registration.organizerEmail,
                roleName: registration.roleName,
            });

        this.logger.log(`Registration created: ${registration.id}`);

        return registration;
    }

    private async getEventDetails(eventId: string): Promise<any> {
        try {
            const eventServiceUrl = this.configService.get('EVENT_SERVICE_URL');
            const response = await axios.get(`${eventServiceUrl}/events/${eventId}`);
            return response.data.data;
        } catch (error) {
            this.logger.error(`Failed to get event details: ${eventId}`, error);
            throw new NotFoundException('Event not found');
        }
    }

    private validateEventForRegistration(event: any): void {
        // Check event status
        if (event.status !== 'published') {
            throw new BadRequestException('Event is not available for registration');
        }

        // Check registration deadline
        const now = new Date();
        const deadline = new Date(event.schedule.registrationDeadline);
        if (now > deadline) {
            throw new BadRequestException('Registration deadline has passed');
        }

        // Check event hasn't started yet
        const startDate = new Date(event.schedule.startDate);
        if (now > startDate) {
            throw new BadRequestException('Event has already started');
        }
    }

    private generateRegistrationCode(): string {
        // Format: REG-YYYYMMDD-XXXX (e.g., REG-20250108-A1B2)
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = uuidv4().slice(0, 4).toUpperCase();
        return `REG-${dateStr}-${randomStr}`;
    }
}
