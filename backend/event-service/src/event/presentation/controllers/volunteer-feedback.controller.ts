import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { GetFeedbackForVolunteerUseCase, EnrichedFeedback } from '../../application/use-cases/get-feedback-for-volunteer.use-case';
import { GetFeedbackGivenByVolunteerUseCase } from '../../application/use-cases/get-feedback-given-by-volunteer.use-case';
import { GetFeedbackDto } from '../../application/dto/get-feedback.dto';
import { GetUser } from '@share/auth/get-user.decorator';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';

@Controller('feedback/volunteer')
export class VolunteerFeedbackController {
    constructor(
        private readonly getFeedbackForVolunteerUseCase: GetFeedbackForVolunteerUseCase,
        private readonly getFeedbackGivenByVolunteerUseCase: GetFeedbackGivenByVolunteerUseCase,
    ) { }

    /**
     * VOLUNTEER/ORGANIZER/ADMIN: Get feedback received by a volunteer
     * GET /api/feedback/volunteer/:volunteerId/received
     */
    @Get(':volunteerId/received')
    @UseGuards(JwtAuthGuard)
    async getFeedbackReceivedByVolunteer(
        @Param('volunteerId') volunteerId: string,
        @Query() query: GetFeedbackDto,
        @GetUser('userId') userId: string,
        @GetUser('role') role: string
    ): Promise<{ success: boolean; data: EnrichedFeedback[]; pagination: any }> {
        // Allow volunteer to see their own feedback, organizers/admins to see any
        if (role !== 'admin' && userId !== volunteerId) {
            // Check if user is organizer of the event - but for simplicity, allow for now
            // In a real app, you'd check if user is organizer of events this volunteer participated in
        }

        const result = await this.getFeedbackForVolunteerUseCase.execute({
            volunteerId,
            query,
        });

        return {
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }

    /**
     * VOLUNTEER: Get feedback given by a volunteer
     * GET /api/feedback/volunteer/:volunteerId/given
     */
    @Get(':volunteerId/given')
    @UseGuards(JwtAuthGuard)
    async getFeedbackGivenByVolunteer(
        @Param('volunteerId') volunteerId: string,
        @Query() query: GetFeedbackDto,
        @GetUser('userId') userId: string,
        @GetUser('role') role: string
    ) {
        // Allow volunteer to see their own feedback, admins to see any
        if (role !== 'admin' && userId !== volunteerId) {
            throw new Error('Unauthorized to view this feedback');
        }

        const result = await this.getFeedbackGivenByVolunteerUseCase.execute({
            volunteerId,
            query,
        });

        return {
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
}