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
import { CheckInDto } from '../dto/action-registration.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CheckInRegistrationUseCase {
    private readonly logger = new Logger(CheckInRegistrationUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly configService: ConfigService
    ) { }

    async execute(
        registrationId: string,
        checkInBy: string,
        dto: CheckInDto,
        isOrganizer: boolean = false
    ): Promise<Registration> {
        // 1. Find registration
        const registration = await this.registrationRepository.findById(registrationId);
        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        // 2. Check permission (organizer hoặc chính volunteer đó)
        if (!isOrganizer && registration.volunteerId !== checkInBy) {
            throw new ForbiddenException('You can only check-in for yourself');
        }

        // 3. Check if can check-in
        if (!registration.canCheckIn()) {
            throw new BadRequestException(`Cannot check-in with status: ${registration.status}`);
        }

        // 4. Validate check-in time window
        this.validateCheckInTime(registration.eventDate);

        // 5. Update registration
        await this.registrationRepository.update(registrationId, {
            status: RegistrationStatus.CHECKED_IN,
            attendance: {
                checkInTime: new Date(),
                checkInBy,
                checkInLocation: dto.location,
                checkInMethod: isOrganizer ? 'manual' : 'self',
                notes: dto.notes,
            },
        } as any);

        this.logger.log(`Registration checked-in: ${registrationId}`);

        const updated = await this.registrationRepository.findById(registrationId);
        return updated!;
    }

    async executeByCode(
        registrationCode: string,
        checkInBy: string,
        dto: CheckInDto
    ): Promise<Registration> {
        const registration = await this.registrationRepository.findByCode(registrationCode);
        if (!registration) {
            throw new NotFoundException('Registration not found with this code');
        }

        return this.execute(registration.id, checkInBy, dto, true);
    }

    private validateCheckInTime(eventDate: Date): void {
        const now = new Date();
        const windowBeforeMinutes = this.configService.get('CHECK_IN_WINDOW_BEFORE_MINUTES') || 60;
        const windowAfterMinutes = this.configService.get('CHECK_IN_WINDOW_AFTER_MINUTES') || 30;

        const earliestCheckIn = new Date(eventDate.getTime() - windowBeforeMinutes * 60 * 1000);
        const latestCheckIn = new Date(eventDate.getTime() + windowAfterMinutes * 60 * 1000);

        if (now < earliestCheckIn) {
            throw new BadRequestException(
                `Check-in opens ${windowBeforeMinutes} minutes before event start`
            );
        }

        if (now > latestCheckIn) {
            throw new BadRequestException(
                `Check-in window closed ${windowAfterMinutes} minutes after event start`
            );
        }
    }
}