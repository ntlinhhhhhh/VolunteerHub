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
import { RejectRegistrationDto } from '../dto/action-registration.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RejectRegistrationUseCase {
    private readonly logger = new Logger(RejectRegistrationUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly amqp: AmqpConnection,
    ) { }

    async execute(
        registrationId: string,
        organizerId: string,
        dto: RejectRegistrationDto
    ): Promise<Registration> {
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        if (registration.organizerId !== organizerId) {
            throw new ForbiddenException('You do not have permission to reject this registration');
        }

        if (!registration.canBeRejected()) {
            throw new BadRequestException(`Cannot reject registration with status: ${registration.status}`);
        }

        await this.registrationRepository.update(registrationId, {
            status: RegistrationStatus.REJECTED,
            approval: {
                reviewedBy: organizerId,
                reviewedAt: new Date(),
                rejectionReason: dto.rejectionReason,
            },
        } as any);

        await this.amqp.publish(
            'notification_exchange',
            'registration.rejected',
            {
                type: 'registration_rejected',
                userId: registration.volunteerId,
                recipient: registration.volunteerEmail,
                registrationId: registration.id,
                eventId: registration.eventId,
                eventTitle: registration.eventTitle,
                volunteerId: registration.volunteerId,
                volunteerName: registration.volunteerName,
                volunteerEmail: registration.volunteerEmail,
                rejectionReason: dto.rejectionReason,
            });

        this.logger.log(`Registration rejected: ${registrationId}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }
}