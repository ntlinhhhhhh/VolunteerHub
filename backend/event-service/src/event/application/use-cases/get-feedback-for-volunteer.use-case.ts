import { Injectable, Inject, Logger } from '@nestjs/common';
import { IFeedbackRepository, PaginatedResult } from '../../domain/repositories/feedback.repository.interface';
import { Feedback } from '../../domain/entities/feedback.entity';
import { GetFeedbackDto } from '../dto/get-feedback.dto';

interface GetFeedbackForVolunteerParams {
    volunteerId: string;
    query?: GetFeedbackDto;
}

@Injectable()
export class GetFeedbackForVolunteerUseCase {
    private readonly logger = new Logger(GetFeedbackForVolunteerUseCase.name);

    constructor(
        @Inject(IFeedbackRepository)
        private readonly feedbackRepository: IFeedbackRepository
    ) { }

    async execute(params: GetFeedbackForVolunteerParams): Promise<PaginatedResult<Feedback>> {
        const { volunteerId, query } = params;

        const options = {
            volunteerId,
            page: query?.page || 1,
            limit: query?.limit || 20,
            sortBy: query?.sortBy || 'createdAt',
            sortOrder: query?.sortOrder || 'desc',
        };

        const result = await this.feedbackRepository.findByVolunteerId(volunteerId, options);

        this.logger.log(`Retrieved ${result.data.length} feedback items for volunteer ${volunteerId}`);

        return result;
    }
}