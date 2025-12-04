import { Injectable, Inject, Logger } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';

/**
 * SYNC ORGANIZER INFO USE CASE
 * 
 * Khi user update profile trong USER SERVICE,
 * event này sẽ được trigger qua RabbitMQ để sync cached data
 */

export interface SyncOrganizerData {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class SyncOrganizerInfoUseCase {
  private readonly logger = new Logger(SyncOrganizerInfoUseCase.name);

  constructor(
    @Inject(IEventRepository)
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(data: SyncOrganizerData): Promise<void> {
    const updateData: any = {};

    if (data.name) {
      updateData.organizerName = data.name;
    }

    if (data.email) {
      updateData.organizerEmail = data.email;
    }

    if (data.phone) {
      updateData.organizerPhone = data.phone;
    }

    if (Object.keys(updateData).length > 0) {
      await this.eventRepository.updateOrganizerInfo(data.userId, updateData);
      this.logger.log(`Synced organizer info for user: ${data.userId}`);
    }
  }
}