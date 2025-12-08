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
import { CancelRegistrationDto } from '../dto/action-registration.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class CancelRegistrationUseCase {
    private readonly logger = new Logger(CancelRegistrationUseCase.name);
    private readonly amqp: AmqpConnection;
    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
    ) { }

    async execute(
        registrationId: string,
        userId: string,
        isVolunteer: boolean,
        dto: CancelRegistrationDto
    ): Promise<Registration> {
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        // Check permission
        if (isVolunteer && registration.volunteerId !== userId) {
            throw new ForbiddenException('You can only cancel your own registration');
        }

        if (!isVolunteer && registration.organizerId !== userId) {
            throw new ForbiddenException('You can only cancel registrations for your events');
        }

        if (!registration.canBeCancelled()) {
            throw new BadRequestException(`Cannot cancel registration with status: ${registration.status}`);
        }

        const newStatus = isVolunteer
            ? RegistrationStatus.CANCELLED_BY_VOLUNTEER
            : RegistrationStatus.CANCELLED_BY_ORGANIZER;

        await this.registrationRepository.updateStatus(registrationId, newStatus);


        // Notify EVENT SERVICE to decrement volunteer count if was accepted -- xử lý để gửi mail về cho người dùng
        // if (newStatus === RegistrationStatus.CANCELLED_BY_ORGANIZER) {
        //     await this.amqp.publish(
        //         'notification_exchange',
        //         'registration.cancelled',
        //         {
        //             type: 'registration_rejected',
        //             registrationId: registration.id,
        //             eventId: registration.eventId,
        //             eventTitle: registration.eventTitle,
        //             volunteerId: registration.volunteerId,
        //             volunteerName: registration.volunteerName,
        //             volunteerEmail: registration.volunteerEmail,
        //             organizerEmail: registration.organizerEmail,
        //             cancelledBy: isVolunteer ? 'volunteer' : 'organizer',
        //             cancellationReason: dto.cancellationReason,
        //         });
        // }

        this.logger.log(`Registration cancelled: ${registrationId} by ${isVolunteer ? 'volunteer' : 'organizer'}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }
}