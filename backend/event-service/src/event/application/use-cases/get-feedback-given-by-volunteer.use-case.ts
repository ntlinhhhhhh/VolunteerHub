import { Injectable, Inject, Logger } from '@nestjs/common';
import { IFeedbackRepository, PaginatedResult } from '../../domain/repositories/feedback.repository.interface';
import { Feedback, FeedbackType } from '../../domain/entities/feedback.entity';
import { GetFeedbackDto } from '../dto/get-feedback.dto';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { EnrichedFeedback } from './get-feedback-for-volunteer.use-case';

interface GetFeedbackGivenByVolunteerParams {
    volunteerId: string;
    query?: GetFeedbackDto;
}

@Injectable()
export class GetFeedbackGivenByVolunteerUseCase {
    private readonly logger = new Logger(GetFeedbackGivenByVolunteerUseCase.name);

    constructor(
        @Inject(IFeedbackRepository)
        private readonly feedbackRepository: IFeedbackRepository,
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository
    ) { }

    async execute(params: GetFeedbackGivenByVolunteerParams): Promise<PaginatedResult<EnrichedFeedback>> {
        const { volunteerId, query } = params;

        const options = {
            volunteerId,
            feedbackType: FeedbackType.VOLUNTEER_TO_EVENT,
            page: query?.page || 1,
            limit: query?.limit || 20,
            sortBy: query?.sortBy || 'createdAt',
            sortOrder: query?.sortOrder || 'desc',
        };

        // Get feedback with populated event data
        const result = await (this.feedbackRepository as any).findAllWithEventData(options);

        // Enrich with event data
        const enrichedData = await Promise.all(
            result.data.map(async (fb: any) => {
                let eventTitle = 'Unknown Event';
                let organizerName = 'Ban tổ chức';

                if (fb.eventId && typeof fb.eventId === 'object') {
                    eventTitle = fb.eventId.title || 'Unknown Event';
                    organizerName = fb.eventId.organizerName || 'Ban tổ chức';
                } else if (fb.eventId) {
                    // Fallback: fetch event data
                    try {
                        const event = await this.eventRepository.findById(fb.eventId);
                        if (event) {
                            eventTitle = event.title;
                            organizerName = event.organizerName;
                        }
                    } catch (error) {
                        this.logger.warn(`Failed to fetch event data for ${fb.eventId}`);
                    }
                }

                return {
                    id: fb.id,
                    eventId: fb.eventId,
                    eventTitle,
                    organizerName,
                    volunteerId: fb.volunteerId,
                    managerId: fb.managerId,
                    feedbackType: fb.feedbackType,
                    rating: fb.rating,
                    comment: fb.comment,
                    createdAt: fb.createdAt,
                    updatedAt: fb.updatedAt,
                };
            })
        );

        this.logger.log(`Retrieved ${enrichedData.length} enriched feedback items given by volunteer ${volunteerId}`);

        return {
            ...result,
            data: enrichedData,
        };
    }
}