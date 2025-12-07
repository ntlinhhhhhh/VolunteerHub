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
import { CancelEventDto } from '../dto/approve-event.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class CancelEventUseCase {
    private readonly logger = new Logger(CancelEventUseCase.name);

    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository,
        private readonly amqp: AmqpConnection,
    ) { }

    async execute(
        eventId: string,
        userId: string,
        dto: CancelEventDto,
        isAdmin: boolean = false
    ): Promise<Event> {
        // 1. Find event
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // 2. Check permission
        if (!isAdmin && event.organizerId !== userId) {
            throw new ForbiddenException('You do not have permission to cancel this event');
        }

        // 3. Check if event can be cancelled
        if (!event.canBeCancelled()) {
            throw new BadRequestException(`Cannot cancel event with status: ${event.status}`);
        }

        // 4. Update status to CANCELLED
        await this.eventRepository.updateStatus(eventId, EventStatus.CANCELLED);

        // 5. Publish event to message bus
        // Notify all registered volunteers (registration service will handle this)
        await this.amqp.publish(
            'notification_exchange',
            'event.cancelled',
            {
                type: 'event_cancelled',
                userId: event.organizerId,
                recipient: event.organizerEmail,
                eventId: event.id,
                eventTitle: event.title,
                organizerId: event.organizerId,
                organizerName: event.organizerName,
                cancellationReason: dto.cancellationReason,
                eventDate: event.schedule.startDate.toISOString(),
            });

        this.logger.log(`Event cancelled: ${eventId} by user: ${userId}`);

        const updatedEvent = await this.eventRepository.findById(eventId);
        return updatedEvent!;
    }
}