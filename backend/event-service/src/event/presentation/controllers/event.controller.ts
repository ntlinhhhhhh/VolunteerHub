import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreateEventUseCase } from '../../application/use-cases/create-event.use-case';
import { UpdateEventUseCase } from '../../application/use-cases/update-event.use-case';
import { SubmitEventForApprovalUseCase } from '../../application/use-cases/submit-event-for-approval.use-case';
import { ApproveEventUseCase } from '../../application/use-cases/approve-event.use-case';
import { RejectEventUseCase } from '../../application/use-cases/reject-event.use-case';
import { PublishEventUseCase } from '../../application/use-cases/publish-event.use-case';
import { CancelEventUseCase } from '../../application/use-cases/cancel-event.use-case';
import { DeleteEventUseCase } from '../../application/use-cases/delete-event.use-case';
import { GetEventByIdUseCase } from '../../application/use-cases/get-event-by-id.use-case';
import { GetEventBySlugUseCase } from '../../application/use-cases/get-event-by-slug.use-case';
import { ListEventsUseCase } from '../../application/use-cases/list-events.use-case';
import { GetEventStatisticsUseCase } from '../../application/use-cases/get-event-statistics.use-case';
import { CreateEventDto } from '../../application/dto/create-event.dto';
import { UpdateEventDto } from '../../application/dto/update-event.dto';
import { FilterEventDto } from '../../application/dto/filter-event.dto';
import { ApproveEventDto, RejectEventDto, CancelEventDto } from '../../application/dto/approve-event.dto';
import { Public } from '@share/auth/public.decorator';
import { Roles } from '@share/auth/roles.decorator';
import { GetUser } from '@share/auth/get-user.decorator';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard'
@Controller('events')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
    constructor(
        private readonly createEventUseCase: CreateEventUseCase,
        private readonly updateEventUseCase: UpdateEventUseCase,
        private readonly submitEventForApprovalUseCase: SubmitEventForApprovalUseCase,
        private readonly approveEventUseCase: ApproveEventUseCase,
        private readonly rejectEventUseCase: RejectEventUseCase,
        private readonly publishEventUseCase: PublishEventUseCase,
        private readonly cancelEventUseCase: CancelEventUseCase,
        private readonly deleteEventUseCase: DeleteEventUseCase,
        private readonly getEventByIdUseCase: GetEventByIdUseCase,
        private readonly getEventBySlugUseCase: GetEventBySlugUseCase,
        private readonly listEventsUseCase: ListEventsUseCase,
        private readonly getEventStatisticsUseCase: GetEventStatisticsUseCase
    ) { }

    /**
     * PUBLIC: List all published events
     * GET /api/events?category=...&city=...&search=...
     */
    @Public()
    @Get()
    async listEvents(@Query() filterDto: FilterEventDto) {
        const result = await this.listEventsUseCase.execute(filterDto);

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
     * PUBLIC: Get event by slug
     * GET /api/events/slug/:slug
     */
    @Public()
    @Get('slug/:slug')
    async getEventBySlug(@Param('slug') slug: string) {
        const event = await this.getEventBySlugUseCase.execute(slug);

        return {
            success: true,
            data: event,
        };
    }

    /**
     * PUBLIC: Get event by ID
     * GET /api/events/:id
     */
    @Public()
    @Get(':id')
    async getEventById(@Param('id') id: string) {
        const event = await this.getEventByIdUseCase.execute(id);

        return {
            success: true,
            data: event,
        };
    }

    /**
     * ORGANIZER/ADMIN: Create new event
     * POST /api/events
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    @Roles('event_manager', 'admin')
    async createEvent(
        @Body() createEventDto: CreateEventDto,
        @GetUser('userId') userId: string,
        @GetUser() user: any
    ) {
        console.log('User from decorator:', user);
        console.log('UserId from decorator:', userId);

        const event = await this.createEventUseCase.execute({
            dto: createEventDto,
            organizerId: userId,
            organizerName: user?.name || 'Unknown',
            organizerEmail: user?.email,
            organizerPhone: user?.phone || '',
        });

        return {
            success: true,
            message: 'Event created successfully',
            data: event,
        };
    }


    /**
     * ORGANIZER: Update event
     * PUT /api/events/:id
     */
    @Put(':id')
    @Roles('event_manager', 'admin')
    async updateEvent(
        @Param('id') id: string,
        @Body() updateEventDto: UpdateEventDto,
        @GetUser('userId') userId: string,
        @GetUser('role') role: string
    ) {
        const isAdmin = role === 'admin';
        const event = await this.updateEventUseCase.execute(id, updateEventDto, userId, isAdmin);

        return {
            success: true,
            message: 'Event updated successfully',
            data: event,
        };
    }

    /**
     * ORGANIZER: Submit event for approval
     * POST /api/events/:id/submit
     */
    @Post(':id/submit')
    @Roles('event_manager', 'admin')
    @HttpCode(HttpStatus.OK)
    async submitForApproval(@Param('id') id: string, @GetUser('userId') userId: string) {
        const event = await this.submitEventForApprovalUseCase.execute(id, userId);

        return {
            success: true,
            message: 'Event submitted for approval',
            data: event,
        };
    }

    /**
     * ADMIN: Approve event
     * POST /api/events/:id/approve
     */
    @Post(':id/approve')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    async approveEvent(
        @Param('id') id: string,
        @GetUser('userId') adminId: string,
        @Body() approveDto: ApproveEventDto
    ) {
        const event = await this.approveEventUseCase.execute(id, adminId, approveDto);

        return {
            success: true,
            message: 'Event approved successfully',
            data: event,
        };
    }

    /**
     * ADMIN: Reject event
     * POST /api/events/:id/reject
     */
    @Post(':id/reject')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    async rejectEvent(
        @Param('id') id: string,
        @GetUser('userId') adminId: string,
        @Body() rejectDto: RejectEventDto
    ) {
        const event = await this.rejectEventUseCase.execute(id, adminId, rejectDto);

        return {
            success: true,
            message: 'Event rejected',
            data: event,
        };
    }

    /**
     * ORGANIZER: Publish event
     * POST /api/events/:id/publish
     */
    @Post(':id/publish')
    @Roles('event_manager', 'admin')
    @HttpCode(HttpStatus.OK)
    async publishEvent(@Param('id') id: string, @GetUser('userId') userId: string) {
        const event = await this.publishEventUseCase.execute(id, userId);

        return {
            success: true,
            message: 'Event published successfully',
            data: event,
        };
    }

    /**
     * ORGANIZER/ADMIN: Cancel event
     * POST /api/events/:id/cancel
     */
    @Post(':id/cancel')
    @Roles('event_manager', 'admin')
    @HttpCode(HttpStatus.OK)
    async cancelEvent(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
        @GetUser('role') role: string,
        @Body() cancelDto: CancelEventDto
    ) {
        const isAdmin = role === 'admin';
        const event = await this.cancelEventUseCase.execute(id, userId, cancelDto, isAdmin);

        return {
            success: true,
            message: 'Event cancelled',
            data: event,
        };
    }

    /**
     * ORGANIZER/ADMIN: Delete event
     * DELETE /api/events/:id
     */
    @Delete(':id')
    @Roles('event_manager', 'admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteEvent(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
        @GetUser('role') role: string
    ) {
        const isAdmin = role === 'admin';
        await this.deleteEventUseCase.execute(id, userId, isAdmin);
    }

    /**
     * ORGANIZER: Get my events
     * GET /api/events/my/list
     */
    @Get('my/list')
    @Roles('event_manager', 'admin')
    async getMyEvents(@GetUser('userId') userId: string, @Query() filterDto: FilterEventDto) {
        const result = await this.listEventsUseCase.execute({
            ...filterDto,
            organizerId: userId,
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
     * ADMIN: Get pending approval events
     * GET /api/events/admin/pending
     */
    @Get('admin/pending')
    @Roles('admin')
    async getPendingEvents() {
        const result = await this.listEventsUseCase.execute({
            status: 'pending_approval' as any,
            sortBy: 'createdAt',
            sortOrder: 'asc',
        });

        return {
            success: true,
            data: result.data,
            total: result.total,
        };
    }

    /**
     * ADMIN: Get statistics
     * GET /api/events/admin/statistics
     */
    @Get('admin/statistics')
    @Roles('admin')
    async getStatistics() {
        const stats = await this.getEventStatisticsUseCase.execute();

        return {
            success: true,
            data: stats,
        };
    }
}