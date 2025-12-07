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
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class CompleteRegistrationUseCase {
    private readonly logger = new Logger(CompleteRegistrationUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly amqp: AmqpConnection,
    ) { }

    async execute(registrationId: string, organizerId: string): Promise<Registration> {
        // 1. Find registration
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        // 2. Check permission
        if (registration.organizerId !== organizerId) {
            throw new ForbiddenException('You can only complete registrations for your events');
        }

        // 3. Check status
        if (registration.status !== RegistrationStatus.CHECKED_OUT) {
            throw new BadRequestException('Registration must be checked-out before completing');
        }

        // 4. Generate certificate URL (placeholder)
        const certificateUrl = await this.generateCertificate(registration);

        // 5. Update registration
        await this.registrationRepository.update(registrationId, {
            status: RegistrationStatus.COMPLETED,
            completion: {
                completedAt: new Date(),
                certificateIssued: true,
                certificateUrl,
            },
        } as any);

        // 6. Publish event to message bus
        await this.amqp.publish(
            'notification_exchange',
            'registration.completed',
            {
                type: 'registration_completed',
                userId: registration.volunteerId,
                recipient: registration.volunteerEmail,
                registrationId: registration.id,
                eventId: registration.eventId,
                eventTitle: registration.eventTitle,
                volunteerId: registration.volunteerId,
                volunteerName: registration.volunteerName,
                volunteerEmail: registration.volunteerEmail,
                hoursContributed: registration.attendance.actualHours || 0,
                certificateUrl,
            });

        this.logger.log(`Registration completed: ${registrationId}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }

    private async generateCertificate(registration: Registration): Promise<string> {
        // TODO: Implement certificate generation (PDF, image)
        // For now, return placeholder URL
        return `https://certificates.volunteerhub.com/${registration.id}.pdf`;
    }
}