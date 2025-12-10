import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../../domain/entities/event.entity';

@Injectable()
export class UpdateEventUseCase {
    private readonly logger = new Logger(UpdateEventUseCase.name);

    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository
    ) { }

    async execute(eventId: string, dto: UpdateEventDto, userId: string, isAdmin: boolean = false): Promise<Event> {
        // 1. Find event
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // 2. Check permission
        if (!isAdmin && event.organizerId !== userId) {
            throw new ForbiddenException('You do not have permission to update this event');
        }

        // 3. Check if event can be edited
        if (!event.canBeEdited()) {
            throw new BadRequestException(`Cannot edit event with status: ${event.status}`);
        }

        // 4. Validate dates if provided
        if (dto.schedule) {
            this.validateSchedule(dto.schedule as any);
        }

        // 5. Validate capacity if provided
        if (dto.capacity) {
            if (dto.capacity.minVolunteers && dto.capacity.maxVolunteers) {
                if (dto.capacity.minVolunteers > dto.capacity.maxVolunteers) {
                    throw new BadRequestException('minVolunteers cannot exceed maxVolunteers');
                }
            }

            // Cannot reduce maxVolunteers below current registrations
            if (dto.capacity.maxVolunteers && dto.capacity.maxVolunteers < event.capacity.currentVolunteers) {
                throw new BadRequestException(
                    `Cannot reduce maxVolunteers below current registrations (${event.capacity.currentVolunteers})`
                );
            }
        }

        // 6. Update event
        const updatedEvent = await this.eventRepository.update(eventId, dto as any);

        this.logger.log(`Event updated: ${eventId} by user: ${userId}`);

        return updatedEvent;
    }

    private validateSchedule(schedule: { startDate?: Date; endDate?: Date; registrationDeadline?: Date }): void {
        const now = new Date();

        if (schedule.startDate) {
            const start = new Date(schedule.startDate);
            if (start < now) {
                throw new BadRequestException('Start date must be in the future');
            }
        }

        if (schedule.startDate && schedule.endDate) {
            const start = new Date(schedule.startDate);
            const end = new Date(schedule.endDate);
            if (end <= start) {
                throw new BadRequestException('End date must be after start date');
            }
        }

        if (schedule.registrationDeadline && schedule.startDate) {
            const deadline = new Date(schedule.registrationDeadline);
            const start = new Date(schedule.startDate);
            if (deadline >= start) {
                throw new BadRequestException('Registration deadline must be before start date');
            }
        }
    }
}