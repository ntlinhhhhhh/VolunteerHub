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
import { RateVolunteerDto } from '../dto/action-registration.dto';

@Injectable()
export class RateVolunteerUseCase {
    private readonly logger = new Logger(RateVolunteerUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository
    ) { }

    async execute(
        registrationId: string,
        organizerId: string,
        dto: RateVolunteerDto
    ): Promise<Registration> {
        // 1. Find registration
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        // 2. Check permission
        if (registration.organizerId !== organizerId) {
            throw new ForbiddenException('You can only rate volunteers from your events');
        }

        // 3. Check status
        if (![RegistrationStatus.COMPLETED, RegistrationStatus.RATED].includes(registration.status)) {
            throw new BadRequestException('Can only rate completed registrations');
        }

        // 4. Check if already rated
        if (registration.completion.organizerFeedback) {
            throw new BadRequestException('You have already rated this volunteer');
        }

        // 5. Update registration
        await this.registrationRepository.update(registrationId, {
            completion: {
                ...registration.completion,
                organizerFeedback: {
                    performance: dto.performance,
                    punctuality: dto.punctuality,
                    teamwork: dto.teamwork,
                    comment: dto.comment,
                    ratedAt: new Date(),
                },
            },
        } as any);

        this.logger.log(`Volunteer rated: ${registrationId}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }
}