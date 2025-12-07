import { Injectable, Inject, Logger } from '@nestjs/common';
import { IRegistrationRepository } from '../../domain/repositories/registration.repository.interface';
import { RegistrationStatus } from '../../domain/entities/registration-status.enum';

@Injectable()
export class HandleEventCancelledUseCase {
    private readonly logger = new Logger(HandleEventCancelledUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository
    ) { }

    async execute(eventId: string): Promise<void> {
        // Cancel all active registrations for this event
        await this.registrationRepository.bulkUpdateStatusByEvent(
            eventId,
            RegistrationStatus.PENDING,
            RegistrationStatus.CANCELLED_BY_ORGANIZER
        );

        await this.registrationRepository.bulkUpdateStatusByEvent(
            eventId,
            RegistrationStatus.ACCEPTED,
            RegistrationStatus.CANCELLED_BY_ORGANIZER
        );

        await this.registrationRepository.bulkUpdateStatusByEvent(
            eventId,
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.CANCELLED_BY_ORGANIZER
        );

        this.logger.log(`Cancelled all registrations for event: ${eventId}`);
    }
}