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

@Injectable()
export class CheckOutRegistrationUseCase {
    private readonly logger = new Logger(CheckOutRegistrationUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository
    ) { }

    async execute(
        registrationId: string,
        organizerId: string,
        isOrganizer: boolean
    ): Promise<Registration> {

        // 1. Find registration
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        // 2. Only organizer is allowed
        if (!isOrganizer) {
            throw new ForbiddenException('Only organizers can check-out volunteers');
        }

        // 3. Check if can check-out
        if (!registration.canCheckOut()) {
            throw new BadRequestException(`Cannot check-out with status: ${registration.status}`);
        }

        // 4. Calculate hours
        const checkInTime = registration.attendance?.checkInTime;
        if (!checkInTime) {
            throw new BadRequestException('Cannot check-out because check-in time is missing');
        }

        const checkOutTime = new Date();
        const actualHours = this.calculateHours(checkInTime, checkOutTime);

        // 5. Update registration
        await this.registrationRepository.update(registrationId, {
            status: RegistrationStatus.CHECKED_OUT,
            attendance: {
                ...registration.attendance,
                checkOutTime,
                checkOutBy: organizerId,
                checkOutMethod: 'manual',
                actualHours
            }
        } as any);

        this.logger.log(
            `Organizer ${organizerId} checked-out registration ${registrationId}, hours: ${actualHours}`
        );

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }

    async executeByCode(
        registrationCode: string,
        organizerId: string
    ): Promise<Registration> {
        const registration = await this.registrationRepository.findByCode(registrationCode);
        if (!registration) {
            throw new NotFoundException('Registration not found with this code');
        }

        return this.execute(registration.id, organizerId, true);
    }

    private calculateHours(checkInTime: Date, checkOutTime: Date): number {
        const diff = checkOutTime.getTime() - checkInTime.getTime();
        return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
    }
}
