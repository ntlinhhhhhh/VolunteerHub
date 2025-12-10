import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { IRegistrationRepository } from '../../domain/repositories/registration.repository.interface';
import { Registration } from '../../domain/entities/registration.entity';
import { RegistrationStatus } from '../../domain/entities/registration-status.enum';
import { AcceptRegistrationDto } from '../dto/action-registration.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { MessagePublisherService } from 'src/event-registration/infrastructure/messaging/message-publisher.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AcceptRegistrationUseCase {
    private readonly logger = new Logger(AcceptRegistrationUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly messagePublisherService: MessagePublisherService,
        @Inject('EVENT_SERVICE') private eventClient: ClientProxy,
    ) { }

    async execute(
        registrationId: string,
        organizerId: string,
        dto: AcceptRegistrationDto
    ): Promise<Registration> {
        // 1. Find registration
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        // 2. Check permission
        if (registration.organizerId !== organizerId) {
            throw new ForbiddenException('You do not have permission to accept this registration');
        }

        // 3. Check if can be accepted
        if (!registration.canBeAccepted()) {
            throw new BadRequestException(`Cannot accept registration with status: ${registration.status}`);
        }

        // 4. Update registration
        await this.registrationRepository.update(registrationId, {
            status: RegistrationStatus.ACCEPTED,
            approval: {
                reviewedBy: organizerId,
                reviewedAt: new Date(),
                acceptanceNote: dto.acceptanceNote,
            },
        } as any);

        // 5. Publish events to message bus
        // Notify EVENT SERVICE to increment volunteer count

        const data = {
            registrationId: registration.id,
            eventId: registration.eventId,
            eventTitle: registration.eventTitle,
            volunteerId: registration.volunteerId,
            volunteerName: registration.volunteerName,
            volunteerEmail: registration.volunteerEmail,
            eventDate: registration.eventDate.toISOString(),
            eventLocation: registration.eventLocation,
            roleName: registration.roleName,
            organizerPhone: registration.organizerEmail,
        }

        await this.messagePublisherService.notifyVolunteerRegistrationAccepted(registration.volunteerId, registration.volunteerEmail, data);

        this.logger.log(`Registration accepted: ${registrationId}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }
}