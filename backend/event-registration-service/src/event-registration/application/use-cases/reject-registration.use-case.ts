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
import { MessagePublisherService } from 'src/event-registration/infrastructure/messaging/message-publisher.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RejectRegistrationUseCase {
    private readonly logger = new Logger(RejectRegistrationUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly messagePublisherService: MessagePublisherService,
        @Inject('EVENT_SERVICE') private eventClient: ClientProxy,
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

        const data = {
            registrationId: registration.id,
                eventId: registration.eventId,
                eventTitle: registration.eventTitle,
                volunteerId: registration.volunteerId,
                volunteerName: registration.volunteerName,
                volunteerEmail: registration.volunteerEmail,
                rejectionReason: dto.rejectionReason,
        }

        await this.messagePublisherService.notifyVolunteerRegistrationRejected(registration.volunteerId, registration.volunteerEmail, data);

        this.logger.log(`Registration rejected: ${registrationId}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }
}