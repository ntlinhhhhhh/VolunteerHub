import { Injectable, Inject, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { IFeedbackRepository } from '../../domain/repositories/feedback.repository.interface';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { Feedback, FeedbackType } from '../../domain/entities/feedback.entity';
import { EventStatus } from '../../domain/entities/event-status.enum';

interface CreateFeedbackParams {
    dto: CreateFeedbackDto;
    userId: string;
}

@Injectable()
export class CreateFeedbackUseCase {
    private readonly logger = new Logger(CreateFeedbackUseCase.name);

    constructor(
        @Inject(IFeedbackRepository)
        private readonly feedbackRepository: IFeedbackRepository,
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository
    ) { }

    async execute(params: CreateFeedbackParams): Promise<Feedback> {
        const { dto, userId } = params;

        // 1. Validate event exists and is completed
        const event = await this.eventRepository.findById(dto.eventId);
        if (!event) {
            throw new BadRequestException('Event not found');
        }

        if (event.status !== EventStatus.COMPLETED) {
            throw new BadRequestException('Feedback can only be given for completed events');
        }

        // 2. Validate based on feedback type
        if (dto.feedbackType === FeedbackType.MANAGER_TO_VOLUNTEER) {
            // Only event organizer can give feedback to volunteers
            if (event.organizerId !== userId) {
                throw new ForbiddenException('Only event organizers can give feedback to volunteers');
            }
            // Check if feedback already exists for this manager-volunteer-event combination
            const existingFeedback = await this.feedbackRepository.findByEventAndVolunteer(dto.eventId, dto.volunteerId);
            if (existingFeedback && existingFeedback.feedbackType === FeedbackType.MANAGER_TO_VOLUNTEER) {
                throw new BadRequestException('Feedback already exists for this volunteer in this event');
            }
        } else if (dto.feedbackType === FeedbackType.VOLUNTEER_TO_EVENT) {
            // Only the volunteer themselves can give feedback about the event
            if (dto.volunteerId !== userId) {
                throw new ForbiddenException('Volunteers can only give feedback about events they participated in');
            }
            // Check if feedback already exists for this volunteer-event combination
            const existingFeedback = await this.feedbackRepository.findByEventAndVolunteer(dto.eventId, dto.volunteerId);
            if (existingFeedback && existingFeedback.feedbackType === FeedbackType.VOLUNTEER_TO_EVENT) {
                throw new BadRequestException('Feedback already exists for this event');
            }
        }

        // 3. Validate rating
        if (dto.rating < 1 || dto.rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        // 4. Create feedback data
        const feedbackData = {
            eventId: dto.eventId,
            volunteerId: dto.volunteerId,
            managerId: dto.feedbackType === FeedbackType.MANAGER_TO_VOLUNTEER ? userId : null,
            feedbackType: dto.feedbackType,
            rating: dto.rating,
            comment: dto.comment,
        };

        // 5. Save to database
        const feedback = await this.feedbackRepository.create(feedbackData as any);

        this.logger.log(`Feedback created: ${feedback.id} (${dto.feedbackType}) for volunteer ${dto.volunteerId} in event ${dto.eventId}`);

        return feedback;
    }
}