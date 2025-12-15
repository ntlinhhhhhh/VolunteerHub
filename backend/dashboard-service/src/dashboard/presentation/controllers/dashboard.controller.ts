import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ExportDashboardDto, ExportDashboardResponseDto } from 'src/dashboard/application/dto/export-dashboard.dto';
import { ExportDashboardUseCase } from 'src/dashboard/application/use-cases/export-dashboard.usecase';
import { GetAdminDashboardUseCase } from 'src/dashboard/application/use-cases/get-admin-dashboard.usecase';
import { GetEventManagerDashboardUseCase } from 'src/dashboard/application/use-cases/get-event-manager-dashboard.usecase';
import { GetVolunteerDashboardUseCase } from 'src/dashboard/application/use-cases/get-volunteer-dashboard.usecase';
import { MetricPeriod } from 'src/dashboard/domain/entities/shared';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly getVolunteerDashboard: GetVolunteerDashboardUseCase,
        private readonly getEventManagerDashboard: GetEventManagerDashboardUseCase,
        private readonly getAdminDashboard: GetAdminDashboardUseCase,
        private readonly exportDashboard: ExportDashboardUseCase
    ) {}

    @Get('volunteer/:userId')
    async getVolunteer(
        @Param('userId') userId: string,
        @Query('period') period: MetricPeriod = MetricPeriod.ALL_TIME
    ) {
        return this.getVolunteerDashboard.execute({ userId, period });
    }

    @Get('manager/:userId')
    async getManagerDashboard(
        @Param('userId') userId: string,
        @Query('period') period: MetricPeriod = MetricPeriod.ALL_TIME
    ) {
        return this.getEventManagerDashboard.execute({ userId, period });
    }

    @Get('admin/:userId')
    async getAdmin(
        @Param('userId') userId: string,
        @Query('period') period: MetricPeriod = MetricPeriod.ALL_TIME
    ) {
        return this.getAdminDashboard.execute({ userId, period });
    }

    @Post('export')
    async exportDashboardData(@Body() dto: ExportDashboardDto): Promise<ExportDashboardResponseDto> {
        return this.exportDashboard.execute(dto);
    }
}
