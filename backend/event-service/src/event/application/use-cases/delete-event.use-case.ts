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

@Injectable()
export class DeleteEventUseCase {
  private readonly logger = new Logger(DeleteEventUseCase.name);

  constructor(
    @Inject(IEventRepository)
    private readonly eventRepository: IEventRepository,
    @Inject(CACHE_MANAGER) 
    private readonly cacheManager: Cache,
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

    // 3. Check if event can be deleted
    // Only DRAFT and REJECTED events can be deleted
    if (![EventStatus.DRAFT, EventStatus.REJECTED].includes(event.status)) {
      throw new BadRequestException(
        `Cannot delete event with status: ${event.status}. Please cancel it instead.`
      );
    }

    // 4. Check if there are registrations
    if (event.capacity.currentVolunteers > 0) {
      throw new BadRequestException('Cannot delete event with existing registrations');
    }

    // 5. Delete event
    await this.eventRepository.delete(eventId);

    // 6. Clear cache
    await this.cacheManager.delete(`event:${eventId}`);
    await this.cacheManager.delete(`event:slug:${event.slug}`);

    this.logger.log(`Event deleted: ${eventId} by user: ${userId}`);
  }
}