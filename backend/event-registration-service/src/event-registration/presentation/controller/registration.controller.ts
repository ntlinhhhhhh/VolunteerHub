import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';

import { CreateRegistrationDto } from '../../application/dto/create-registration.dto';
import { FilterRegistrationDto } from '../../application/dto/filter-registration.dto';
import {
    AcceptRegistrationDto,
    RejectRegistrationDto,
    CancelRegistrationDto,
    RateEventDto,
    RateVolunteerDto,
} from '../../application/dto/action-registration.dto';

import { Roles } from '@share/auth/roles.decorator';
import { GetUser } from '@share/auth/get-user.decorator';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard'


import { ApplyForEventUseCase } from '../../application/use-cases/apply-for-event.use-case';
import { AcceptRegistrationUseCase } from '../../application/use-cases/accept-registration.use-case';
import { CancelRegistrationUseCase } from '../../application/use-cases/cancel-registration.use-case';
import { CheckInRegistrationUseCase } from '../../application/use-cases/check-in-registration.use-case';
import { CheckOutRegistrationUseCase } from '../../application/use-cases/check-out-registration.use-case';
import { CompleteRegistrationUseCase } from '../../application/use-cases/complete-registration.use-case';
import { RateEventUseCase } from '../../application/use-cases/rate-event.use-case';
import { RateVolunteerUseCase } from '../../application/use-cases/rate-volunteer.use-case';
import { ListRegistrationsUseCase } from '../../application/use-cases/list-registrations.use-case';
import { GetRegistrationByIdUseCase } from '../../application/use-cases/get-registration-by-id.use-case';
import { GetVolunteerStatisticsUseCase } from '../../application/use-cases/get-volunteer-statistics.use-case';
import { RejectRegistrationUseCase } from 'src/event-registration/application/use-cases/reject-registration.use-case';
import { ConfirmAttendanceUseCase } from 'src/event-registration/application/use-cases/confirm-attendance.use-case';

@Controller('registrations')

export class RegistrationController {
    constructor(
        private readonly applyForEventUseCase: ApplyForEventUseCase,
        private readonly confirmAttendanceUseCase: ConfirmAttendanceUseCase,
        private readonly acceptRegistrationUseCase: AcceptRegistrationUseCase,
        private readonly rejectRegistrationUseCase: RejectRegistrationUseCase,
        private readonly cancelRegistrationUseCase: CancelRegistrationUseCase,
        private readonly checkInRegistrationUseCase: CheckInRegistrationUseCase,
        private readonly checkOutRegistrationUseCase: CheckOutRegistrationUseCase,
        private readonly completeRegistrationUseCase: CompleteRegistrationUseCase,
        private readonly rateEventUseCase: RateEventUseCase,
        private readonly rateVolunteerUseCase: RateVolunteerUseCase,
        private readonly listRegistrationsUseCase: ListRegistrationsUseCase,
        private readonly getRegistrationByIdUseCase: GetRegistrationByIdUseCase,
        private readonly getVolunteerStatisticsUseCase: GetVolunteerStatisticsUseCase,
    ) { }

    // ===========================================
    // VOLUNTEER ACTIONS
    // ===========================================

    @Post('apply')
    @UseGuards(JwtAuthGuard)
    @Roles('volunteer')
    async applyForEvent(@GetUser() user: any, @Body() dto: CreateRegistrationDto) {
        const registration = await this.applyForEventUseCase.execute(
            dto,
            user.userId,
            user.name,
            user.email,
            user.phoneNumber || '0969584382',
        );

        return {
            success: true,
            message: 'Application submitted successfully',
            data: registration,
        };
    }

    @Put(':id/confirm')
    @Roles('volunteer')
    @UseGuards(JwtAuthGuard)
    async confirmAttendance(@GetUser() user, @Param('id') id: string) {
        const registration = await this.confirmAttendanceUseCase.execute(id, user.userId);
        return {
            success: true,
            message: 'Attendance confirmed',
            data: registration
        };
    }

    @Put(':id/rate')
    @Roles('volunteer')
    @UseGuards(JwtAuthGuard)
    async rateEvent(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() dto: RateEventDto,
    ) {
        const registration = await this.rateEventUseCase.execute(
            id,
            user.userId,
            dto,
        );

        return {
            success: true,
            message: 'Event rated successfully',
            data: registration,
        };
    }

    @Delete(':id/cancel')
    @Roles('volunteer')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async cancelByVolunteer(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: CancelRegistrationDto,
    ) {
        const registration = await this.cancelRegistrationUseCase.execute(
            id,
            req.user.userId,
            true,
            dto,
        );

        return {
            success: true,
            message: 'Registration cancelled successfully',
            data: registration,
        };
    }

    // ===========================================
    // ORGANIZER ACTIONS
    // ===========================================

    @Put(':id/accept')
    @Roles('organizer')
    @UseGuards(JwtAuthGuard)
    async acceptRegistration(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() dto: AcceptRegistrationDto,
    ) {
        console.log('event-maanger-id', user.userId)
        const registration = await this.acceptRegistrationUseCase.execute(
            id,
            user.userId,
            dto,
        );

        return {
            success: true,
            message: 'Registration accepted',
            data: registration,
        };
    }

    @Put(':id/reject')
    @Roles('organizer')
    @UseGuards(JwtAuthGuard)
    async rejectRegistration(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() dto: RejectRegistrationDto,
    ) {
        const registration = await this.rejectRegistrationUseCase.execute(
            id,
            user.userId,
            dto,
        );

        return {
            success: true,
            message: 'Registration rejected',
            data: registration,
        };
    }

    @Delete(':id/cancel-by-organizer')
    @Roles('organizer')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async cancelByOrganizer(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() dto: CancelRegistrationDto,
    ) {
        const registration = await this.cancelRegistrationUseCase.execute(
            id,
            user.userId,
            false,
            dto,
        );

        return {
            success: true,
            message: 'Registration cancelled by organizer',
            data: registration,
        };
    }

    @Put(':id/check-in')
    @Roles('organizer')
    async organizerCheckIn(
        @Param('id') registrationId: string,
        @GetUser() user: any,
    ) {
        const organizerId = user?.id;

        const result = await this.checkInRegistrationUseCase.execute(
            registrationId,
            organizerId,
            true // isOrganizer
        );

        return {
            success: true,
            message: 'Volunteer checked-in successfully',
            data: result,
        };
    }

    @Put(':id/check-out')
    @Roles('organizer')
    async organizerCheckOut(
        @Param('id') registrationId: string,
        @GetUser() user: any,
    ) {
        const organizerId = user?.id;

        const result = await this.checkOutRegistrationUseCase.execute(
            registrationId,
            organizerId,
            true // isOrganizer
        );

        return {
            success: true,
            message: 'Volunteer checked-out successfully',
            data: result,
        };
    }


    @Post('check-in-by-code')
    @Roles('organizer')
    @UseGuards(JwtAuthGuard)
    async checkInByCode(
        @GetUser() user: any,
        @Body('code') code: string,
    ) {
        const registration = await this.checkInRegistrationUseCase.executeByCode(
            code,
            user.userId,
        );

        return {
            success: true,
            message: 'Volunteer checked in',
            data: registration,
        };
    }

    @Post('check-out-by-code')
    @Roles('organizer')
    @UseGuards(JwtAuthGuard)
    async checkOutByCode(
        @GetUser() user: any,
        @Body('code') code: string,
    ) {
        const registration = await this.checkOutRegistrationUseCase.executeByCode(
            code,
            user.userId,
        );

        return {
            success: true,
            message: 'Volunteer checked out',
            data: registration,
        };
    }

    @Put(':id/complete')
    @Roles('organizer')
    @UseGuards(JwtAuthGuard)
    async completeRegistration(@GetUser() user: any, @Param('id') id: string) {
        const registration = await this.completeRegistrationUseCase.execute(
            id,
            user.userId,
        );

        return {
            success: true,
            message: 'Registration completed',
            data: registration,
        };
    }

    @Put(':id/rate-volunteer')
    @Roles('organizer')
    @UseGuards(JwtAuthGuard)
    async rateVolunteer(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() dto: RateVolunteerDto,
    ) {
        const registration = await this.rateVolunteerUseCase.execute(
            id,
            user.userId,
            dto,
        );

        return {
            success: true,
            message: 'Volunteer rated successfully',
            data: registration,
        };
    }

    // ===========================================
    // QUERIES
    // ===========================================

    @Get()
    async listRegistrations(@Query() filterDto: FilterRegistrationDto) {
        const result = await this.listRegistrationsUseCase.execute(filterDto);

        return {
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        };
    }

    @Get('my-registrations')
    @Roles('volunteer')
    @UseGuards(JwtAuthGuard)
    async getMyRegistrations(
        @GetUser() user: any,
        @Query() filterDto: FilterRegistrationDto,
    ) {
        const result = await this.listRegistrationsUseCase.execute({
            ...filterDto,
            volunteerId: user.userId,
        });

        return {
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        };
    }

    @Get('my-statistics')
    @Roles('volunteer')
    @UseGuards(JwtAuthGuard)
    async getMyStatistics(@GetUser() user: any) {
        const statistics = await this.getVolunteerStatisticsUseCase.execute(
            user.userId,
        );

        return {
            success: true,
            data: statistics,
        };
    }

    @Get(':id')
    async getRegistrationById(@Param('id') id: string) {
        const registration = await this.getRegistrationByIdUseCase.execute(id);

        return {
            success: true,
            data: registration,
        };
    }
}
