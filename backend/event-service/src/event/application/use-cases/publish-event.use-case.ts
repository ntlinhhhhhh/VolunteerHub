import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { Event } from '../../domain/entities/event.entity';
import { EventStatus } from '../../domain/entities/event-status.enum';

@Injectable()
export class PublishEventUseCase {
    private readonly logger = new Logger(PublishEventUseCase.name);

    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository
    ) { }

    async execute(eventId: string, userId: string): Promise<Event> {
        // 1. Find event
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // 2. Check permission
        if (event.organizerId !== userId) {
            throw new ForbiddenException('You do not have permission to publish this event');
        }

        // 3. Check if event can be published
        if (!event.canBePublished()) {
            throw new BadRequestException(`Cannot publish event with status: ${event.status}`);
        }

        // 4. Update status to PUBLISHED
        await this.eventRepository.updateStatus(eventId, EventStatus.PUBLISHED);

        this.logger.log(`Event published: ${eventId} by organizer: ${userId}`);

        const updatedEvent = await this.eventRepository.findById(eventId);
        return updatedEvent!;
    }
}