import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { EventStatus } from '../../domain/entities/event-status.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';

@Injectable()
export class DeleteEventUseCase {
  private readonly logger = new Logger(DeleteEventUseCase.name);

  constructor(
    @Inject(IEventRepository)
    private readonly eventRepository: IEventRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: cacheManager_1.Cache,
  ) {}

  async execute(eventId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    // 1. Find event
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Check permission
    if (!isAdmin && event.organizerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this event');
    }

    // 3. Only DRAFT or REJECTED can be deleted
    if (![EventStatus.DRAFT, EventStatus.REJECTED].includes(event.status)) {
      throw new BadRequestException(
        `Cannot delete event with status: ${event.status}. Please cancel it instead.`,
      );
    }

    // 4. Cannot delete if event has volunteers
    if (event.capacity.currentVolunteers > 0) {
      throw new BadRequestException('Cannot delete event with existing registrations');
    }

    // 5. Delete
    await this.eventRepository.delete(eventId);

    // 6. Clear cache (USE del() instead of delete())
    await this.cacheManager.del(`event:${eventId}`);
    await this.cacheManager.del(`event:slug:${event.slug}`);

    this.logger.log(`Event deleted: ${eventId} by user: ${userId}`);
  }
}
