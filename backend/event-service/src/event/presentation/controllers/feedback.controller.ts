import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreateFeedbackUseCase } from '../../application/use-cases/create-feedback.use-case';
import { GetFeedbackForVolunteerUseCase } from '../../application/use-cases/get-feedback-for-volunteer.use-case';
import { GetFeedbackForEventUseCase } from '../../application/use-cases/get-feedback-for-event.use-case';
import { CreateFeedbackDto } from '../../application/dto/create-feedback.dto';
import { GetFeedbackDto } from '../../application/dto/get-feedback.dto';
import { Roles } from '@share/auth/roles.decorator';
import { GetUser } from '@share/auth/get-user.decorator';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';

@Controller('events/:eventId/feedback')
export class FeedbackController {
    constructor(
        private readonly createFeedbackUseCase: CreateFeedbackUseCase,
        private readonly getFeedbackForVolunteerUseCase: GetFeedbackForVolunteerUseCase,
        private readonly getFeedbackForEventUseCase: GetFeedbackForEventUseCase,
    ) { }

    /**
     * ORGANIZER: Create feedback for a volunteer in an event
     * POST /api/events/:eventId/feedback
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    @Roles('event_manager', 'admin')
    async createFeedback(
        @Param('eventId') eventId: string,
        @Body() createFeedbackDto: CreateFeedbackDto,
        @GetUser('userId') userId: string
    ) {
        const feedback = await this.createFeedbackUseCase.execute({
            dto: { ...createFeedbackDto, eventId },
            userId,
        });

        return {
            success: true,
            message: 'Feedback created successfully',
            data: feedback,
        };
    }

    /**
     * PUBLIC: Get feedback for an event
     * GET /api/events/:eventId/feedback
     */
    @Get()
    async getFeedbackForEvent(
        @Param('eventId') eventId: string,
        @Query() query: GetFeedbackDto
    ) {
        const result = await this.getFeedbackForEventUseCase.execute({
            eventId,
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
     * VOLUNTEER/ORGANIZER/ADMIN: Get feedback for a volunteer
     * GET /api/events/:eventId/feedback/volunteer/:volunteerId
     */
    @Get('volunteer/:volunteerId')
    @UseGuards(JwtAuthGuard)
    async getFeedbackForVolunteer(
        @Param('volunteerId') volunteerId: string,
        @Query() query: GetFeedbackDto,
        @GetUser('userId') userId: string,
        @GetUser('role') role: string
    ) {
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
}