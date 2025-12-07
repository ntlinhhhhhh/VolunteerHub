import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { Event } from '../../domain/entities/event.entity';
import { EventStatus } from '../../domain/entities/event-status.enum';
import { RejectEventDto } from '../dto/approve-event.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RejectEventUseCase {
    private readonly logger = new Logger(RejectEventUseCase.name);

    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository,
        private readonly amqp: AmqpConnection,

    ) { }

    async execute(eventId: string, adminId: string, dto: RejectEventDto): Promise<Event> {
        // 1. Find event
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // 2. Check current status
        if (event.status !== EventStatus.PENDING_APPROVAL) {
            throw new BadRequestException(`Cannot reject event with status: ${event.status}`);
        }

        // 3. Update status and rejection info
        await this.eventRepository.update(eventId, {
            status: EventStatus.REJECTED,
            approval: {
                approvedBy: adminId,
                reviewedAt: new Date(),
                rejectionReason: dto.rejectionReason,
            },
        } as any);

        // 4. Publish event to message bus (notify organizer)
        await this.amqp.publish(
            'notification_exchange',
            'event.rejected',
            {
                type: "event_rejected",
                userId: event.organizerId,
                recipient: event.organizerEmail,
                eventId: event.id,
                eventTitle: event.title,
                eventSlug: event.slug,
                organizerId: event.organizerId,
                organizerName: event.organizerName,
                organizerEmail: event.organizerEmail,
                rejectionReason: dto.rejectionReason,
            });

        this.logger.log(`Event rejected: ${eventId} by admin: ${adminId}`);

        const updatedEvent = await this.eventRepository.findById(eventId);
        return updatedEvent!;
    }
}