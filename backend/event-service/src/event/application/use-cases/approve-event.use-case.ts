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
import { ApproveEventDto } from '../dto/approve-event.dto';
import { MessagePublisherService } from 'src/event/infrastructure/messaging/message-publisher.service';


@Injectable()
export class ApproveEventUseCase {
    private readonly logger = new Logger(ApproveEventUseCase.name);

    constructor(
        @Inject(IEventRepository) private readonly eventRepository: IEventRepository,
        private readonly messagePublisherService: MessagePublisherService,
    ) { }

    async execute(eventId: string, adminId: string, dto: ApproveEventDto): Promise<Event> {
        // 1. Find event
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // 2. Check current status
        if (event.status !== EventStatus.PENDING_APPROVAL) {
            throw new BadRequestException(`Cannot approve event with status: ${event.status}`);
        }

        // 3. Update status and approval info
        await this.eventRepository.update(eventId, {
            status: EventStatus.APPROVED,
            approval: {
                approvedBy: adminId,
                approvedAt: new Date(),
                reviewedAt: new Date(),
            },
        } as any);

        console.log('event', event);
        // 4. Publish event to message bus (notify organizer)
        const data = {
            eventId: event.id,
            eventTitle: event.title,
            eventSlug: event.slug,
            organizerId: event.organizerId,
            organizerName: event.organizerName,
            organizerEmail: event.organizerEmail,
            eventDate: event.schedule.startDate.toISOString(),
            eventLocation: `${event.location.address}, ${event.location.district}, ${event.location.city}`,
            maxVolunteers: event.capacity.maxVolunteers,
            approvalNote: dto.note || '',
        }

        await this.messagePublisherService.notifyEventManagerEventApproved(event.organizerId, event.organizerEmail, data);

        this.logger.log(`Event approved: ${eventId} by admin: ${adminId}`);

        const updatedEvent = await this.eventRepository.findById(eventId);
        return updatedEvent!;
    }
}
