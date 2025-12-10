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

@Injectable()
export class CheckInRegistrationUseCase {
    private readonly logger = new Logger(CheckInRegistrationUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository,
        private readonly configService: ConfigService
    ) {}

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

        // 2. Only organizer can check-in
        if (!isOrganizer) {
            throw new ForbiddenException('Only organizers can check-in volunteers');
        }

        // 3. Validate status
        if (!registration.canCheckIn()) {
            throw new BadRequestException(`Cannot check-in with status: ${registration.status}`);
        }

        // 4. Validate time window
        this.validateCheckInTime(registration.eventDate);

        // 5. Update registration
        await this.registrationRepository.update(registrationId, {
            status: RegistrationStatus.CHECKED_IN,
            attendance: {
                checkInTime: new Date(),
                checkInBy: organizerId,
                checkInMethod: 'manual'
            }
        } as any);

        this.logger.log(`Organizer ${organizerId} checked-in registration ${registrationId}`);

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

    private validateCheckInTime(eventDate: Date): void {
        const now = new Date();
        const windowBeforeMinutes =
            this.configService.get<number>('CHECK_IN_WINDOW_BEFORE_MINUTES') ?? 60;
        const windowAfterMinutes =
            this.configService.get<number>('CHECK_IN_WINDOW_AFTER_MINUTES') ?? 30;

        const earliest = new Date(eventDate.getTime() - windowBeforeMinutes * 60 * 1000);
        const latest = new Date(eventDate.getTime() + windowAfterMinutes * 60 * 1000);

        if (now < earliest) {
            throw new BadRequestException(
                `Check-in opens ${windowBeforeMinutes} minutes before event start`
            );
        }

        if (now > latest) {
            throw new BadRequestException(
                `Check-in closed ${windowAfterMinutes} minutes after event start`
            );
        }
    }
}
