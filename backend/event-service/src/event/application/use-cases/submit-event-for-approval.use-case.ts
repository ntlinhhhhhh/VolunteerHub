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
import { MessagePublisherService } from 'src/event/infrastructure/messaging/message-publisher.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SubmitEventForApprovalUseCase {
    private readonly logger = new Logger(SubmitEventForApprovalUseCase.name);

    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository,
        private readonly messagePublisherService: MessagePublisherService,
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    ) { }

    async execute(eventId: string, userId: string, email: string): Promise<Event> {
        // 1. Find event
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // 2. Check permission
        if (event.organizerId !== userId) {
            throw new ForbiddenException('You do not have permission to submit this event');
        }

        // 3. Check current status
        if (event.status !== EventStatus.DRAFT && event.status !== EventStatus.REJECTED) {
            throw new BadRequestException(`Cannot submit event with status: ${event.status}`);
        }

        // 4. Validate event is complete
        this.validateEventComplete(event);

        // 5. Update status to PENDING_APPROVAL
        await this.eventRepository.updateStatus(eventId, EventStatus.PENDING_APPROVAL);



        const result = await firstValueFrom(
            this.authClient.send('auth.search', { role: 'admin' })
        );

        const admins = result?.data?.users || [];
        console.log('admin', admins)


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
        }


        await Promise.all(admins.map(admin =>
            this.messagePublisherService.notifyAdminsEventPending(admin.id, admin.email, data)
        ));

        this.logger.log(`Event submitted for approval: ${eventId}`);

        const updatedEvent = await this.eventRepository.findById(eventId);
        return updatedEvent!;
    }

    private validateEventComplete(event: Event): void {
        const errors: string[] = [];

        if (!event.title || event.title.length < 10) {
            errors.push('Title must be at least 10 characters');
        }

        if (!event.description || event.description.length < 50) {
            errors.push('Description must be at least 50 characters');
        }

        if (!event.location.address) {
            errors.push('Address is required');
        }

        if (!event.roles || event.roles.length === 0) {
            errors.push('At least one role is required');
        }

        if (event.media.images.length === 0) {
            errors.push('At least one image is required');
        }

        if (errors.length > 0) {
            throw new BadRequestException({
                message: 'Event is incomplete',
                errors,
            });
        }
    }
}