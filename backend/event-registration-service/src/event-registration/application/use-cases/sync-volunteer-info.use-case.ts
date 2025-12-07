import { Injectable, Inject, Logger } from '@nestjs/common';
import { IRegistrationRepository } from '../../domain/repositories/registration.repository.interface';

export interface SyncVolunteerData {
    userId: string;
    name?: string;
    email?: string;
    phone?: string;
}

@Injectable()
export class SyncVolunteerInfoUseCase {
    private readonly logger = new Logger(SyncVolunteerInfoUseCase.name);

    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository
    ) { }

    async execute(data: SyncVolunteerData): Promise<void> {
        const updateData: any = {};

        if (data.name) {
            updateData.volunteerName = data.name;
        }

        if (data.email) {
            updateData.volunteerEmail = data.email;
        }

        if (data.phone) {
            updateData.volunteerPhone = data.phone;
        }

        if (Object.keys(updateData).length > 0) {
            await this.registrationRepository.updateVolunteerInfo(data.userId, updateData);
            this.logger.log(`Synced volunteer info for user: ${data.userId}`);
        }
    }
}