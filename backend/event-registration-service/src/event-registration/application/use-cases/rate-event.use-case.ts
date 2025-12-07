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
import { RateEventDto } from '../dto/action-registration.dto';

@Injectable()
export class RateEventUseCase {
    private readonly logger = new Logger(RateEventUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository
    ) { }

    async execute(
        registrationId: string,
        volunteerId: string,
        dto: RateEventDto
    ): Promise<Registration> {
        // 1. Find registration
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        // 2. Check permission
        if (registration.volunteerId !== volunteerId) {
            throw new ForbiddenException('You can only rate your own registrations');
        }

        // 3. Check if can be rated
        if (!registration.canBeRated()) {
            throw new BadRequestException('Registration cannot be rated at this time');
        }

        // 4. Update registration
        await this.registrationRepository.update(registrationId, {
            status: RegistrationStatus.RATED,
            completion: {
                ...registration.completion,
                volunteerRating: {
                    stars: dto.stars,
                    review: dto.review,
                    ratedAt: new Date(),
                },
            },
        } as any);

        this.logger.log(`Event rated: ${registrationId}, stars: ${dto.stars}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }
}