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
import { MessagePublisherService } from 'src/event/infrastructure/messaging/message-publisher.service';

@Injectable()
export class RejectEventUseCase {
    private readonly logger = new Logger(RejectEventUseCase.name);

    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository,
        private readonly messagePublisherService: MessagePublisherService,
        

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
            rejectionReason: dto.rejectionReason,
        }

        await this.messagePublisherService.notifyEventManagerEventRejected(event.organizerId,event.organizerEmail, data)
        
        this.logger.log(`Event rejected: ${eventId} by admin: ${adminId}`);

        const updatedEvent = await this.eventRepository.findById(eventId);
        return updatedEvent!;
    }
}