import { Injectable, Inject, Logger } from '@nestjs/common';
import { IFeedbackRepository, PaginatedResult } from '../../domain/repositories/feedback.repository.interface';
import { Feedback } from '../../domain/entities/feedback.entity';
import { GetFeedbackDto } from '../dto/get-feedback.dto';

interface GetFeedbackForEventParams {
    eventId: string;
    query?: GetFeedbackDto;
}

@Injectable()
export class GetFeedbackForEventUseCase {
    private readonly logger = new Logger(GetFeedbackForEventUseCase.name);

    constructor(
        @Inject(IFeedbackRepository)
        private readonly feedbackRepository: IFeedbackRepository
    ) { }

    async execute(params: GetFeedbackForEventParams): Promise<PaginatedResult<Feedback>> {
        const { eventId, query } = params;

        const options = {
            eventId,
            page: query?.page || 1,
            limit: query?.limit || 20,
            sortBy: query?.sortBy || 'createdAt',
            sortOrder: query?.sortOrder || 'desc',
        };

        const result = await this.feedbackRepository.findByEventId(eventId, options);

        this.logger.log(`Retrieved ${result.data.length} feedback items for event ${eventId}`);

        return result;
    }
}