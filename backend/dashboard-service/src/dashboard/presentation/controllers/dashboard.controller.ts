import { Controller, Get, Query, Param } from '@nestjs/common';
import { GetTrendingEventsUseCase } from '../../application/use-cases/get-trending-events.use-case';
import { GetRecentActivitiesUseCase } from '../../application/use-cases/get-recent-activities.use-case';
import { GetUserStatsUseCase } from '../../application/use-cases/get-user-stats.use-case';
import { DashboardQueryDto } from '../../application/dto/dashboard-query.dto';
import { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import { Inject } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getTrendingEventsUseCase: GetTrendingEventsUseCase,
    private readonly getRecentActivitiesUseCase: GetRecentActivitiesUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase,
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  /**
   * GET /dashboard/trending-events
   * Lấy danh sách sự kiện thịnh hành
   */
  @Get('trending-events')
  async getTrendingEvents(@Query() query: DashboardQueryDto) {
    const events = await this.getTrendingEventsUseCase.execute(query.limit || 10);

    return {
      success: true,
      data: events,
    };
  }

  /**
   * GET /dashboard/recent-activities
   * Lấy hoạt động gần đây
   */
  @Get('recent-activities')
  async getRecentActivities(@Query() query: DashboardQueryDto) {
    const activities = await this.getRecentActivitiesUseCase.execute(query.limit || 20);

    return {
      success: true,
      data: activities,
    };
  }

  /**
   * GET /dashboard/user-stats/:userId
   * Lấy thống kê của user
   */
  @Get('user-stats/:userId')
  async getUserStats(@Param('userId') userId: string) {
    const stats = await this.getUserStatsUseCase.execute(userId);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /dashboard/overview
   * Tổng quan hệ thống (Admin)
   */
  @Get('overview')
  async getOverview() {
    const [totalEvents, totalUsers, totalRegistrations] = await Promise.all([
      this.dashboardRepository.getTotalEvents(),
      this.dashboardRepository.getTotalUsers(),
      this.dashboardRepository.getTotalRegistrations(),
    ]);

    return {
      success: true,
      data: {
        totalEvents,
        totalUsers,
        totalRegistrations,
        updatedAt: new Date(),
      },
    };
  }
}