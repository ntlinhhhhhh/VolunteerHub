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
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
/**
 * USE CASE #5: Volunteer xác nhận sẽ tham dự
 * Flow: ACCEPTED → CONFIRMED
 */
@Injectable()
export class ConfirmAttendanceUseCase {
    private readonly logger = new Logger(ConfirmAttendanceUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly configService: ConfigService,
    ) { }

    async execute(registrationId: string, volunteerId: string): Promise<Registration> {
        const EVENT_SERVICE_URL = `http://localhost:4006`
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        if (registration.volunteerId !== volunteerId) {
            throw new ForbiddenException('You can only confirm your own registration');
        }

        if (registration.status !== RegistrationStatus.ACCEPTED) {
            throw new BadRequestException(
                `Cannot confirm registration with status: ${registration.status}`
            );
        }

        // Check event hasn't started yet
        const now = new Date();
        if (now > registration.eventDate) {
            throw new BadRequestException('Event has already started');
        }

        await this.registrationRepository.updateStatus(registrationId, RegistrationStatus.CONFIRMED);

        this.logger.log(`Registration confirmed: ${registrationId}`);

        const eventServiceUrl = this.configService.get('EVENT_SERVICE_URL');
        try {
            await axios.patch(`${eventServiceUrl}/events/${registration.eventId}/roles/${registration.roleId}/increment-filled`);
        } catch (error) {
            console.error('Failed to increment filled for event role:', error.message);
        }


        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }
}