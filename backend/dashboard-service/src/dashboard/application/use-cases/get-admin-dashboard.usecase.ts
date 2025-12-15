import { GetAdminDashboardDto } from '../dto/admin-dashboard.dto';
import { AdminDashboard } from '../../domain/entities/admin-dashboard.entity';
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { IDashboardRepository } from 'src/dashboard/domain/repositories/dashboard.repository.interface';
import type { ICacheService } from 'src/dashboard/domain/repositories/dashboard-cache.repository.interface';
import { UserRole } from 'src/dashboard/domain/entities/volunteer-dashboard.entity';

@Injectable()
export class GetAdminDashboardUseCase {
    private readonly logger = new Logger(GetAdminDashboardUseCase.name);

    constructor(
        @Inject('IDashboardRepository')
        private readonly dashboardRepository: IDashboardRepository,
        @Inject('ICacheService')
        private readonly cacheService: ICacheService,
    ) { }

    async execute(dto: GetAdminDashboardDto): Promise<AdminDashboard> {
        try {
            const cacheKey = `dashboard:admin:${dto.userId}:${dto.period}`;

            // Check cache
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                this.logger.log(`Cache HIT for ${cacheKey}`);
                return JSON.parse(cached);
            }

            this.logger.log(`Cache MISS for ${cacheKey}, building admin dashboard...`);

            // Fetch all admin data in parallel for better performance
            const [
                systemKPIs,
                userAnalytics,
                eventAnalytics,
                registrationAnalytics,
                engagementAnalytics,
                systemHealth,
                recentActivities,
                alerts,
                notifications,
                availableReports
            ] = await Promise.all([
                this.dashboardRepository.getSystemKPIs(dto.period),
                this.dashboardRepository.getUserAnalytics(dto.period),
                this.dashboardRepository.getEventAnalytics(dto.period),
                this.dashboardRepository.getRegistrationAnalytics(dto.period),
                this.dashboardRepository.getEngagementAnalytics(dto.period),
                this.dashboardRepository.getSystemHealth(),
                this.dashboardRepository.findRecentActivities(20),
                this.dashboardRepository.getSystemAlerts(50),
                this.dashboardRepository.getNotifications(dto.userId, 20),
                this.dashboardRepository.getAvailableReports()
            ]);

            // Build comprehensive admin dashboard
            const dashboard: AdminDashboard = {
                userId: dto.userId,
                role: UserRole.ADMIN,
                period: dto.period,
                systemOverview: systemKPIs?.systemOverview || {
                    totalUsers: 0,
                    totalEvents: 0,
                    totalRegistrations: 0,
                    totalHoursVolunteered: 0,
                    activeUsers: 0,
                    systemUptime: 0
                },
                kpis: systemKPIs?.kpis || {
                    userGrowthRate: 0,
                    eventCompletionRate: 0,
                    volunteerRetentionRate: 0,
                    averageEventRating: 0,
                    platformEngagementScore: 0
                },
                userAnalytics: userAnalytics || {
                    byRole: {},
                    byStatus: {},
                    registrationTrend: [],
                    activeUsersTrend: [],
                    topVolunteers: [],
                    topEventManagers: []
                },
                eventAnalytics: eventAnalytics || {
                    byStatus: {},
                    byCategory: {},
                    creationTrend: [],
                    completionTrend: [],
                    averageVolunteersPerEvent: 0,
                    mostPopularEvents: []
                },
                registrationAnalytics: registrationAnalytics || {
                    byStatus: {},
                    registrationTrend: [],
                    attendanceRate: 0,
                    cancellationRate: 0,
                    averageHoursPerRegistration: 0
                },
                engagementAnalytics: engagementAnalytics || {
                    dailyActiveUsers: [],
                    monthlyActiveUsers: [],
                    averageSessionDuration: 0,
                    featureUsage: {},
                    userRetention: {}
                },
                systemHealth: systemHealth || {
                    status: 'UNKNOWN',
                    uptime: 0,
                    responseTime: 0,
                    errorRate: 0,
                    activeConnections: 0,
                    databaseStatus: 'UNKNOWN',
                    cacheStatus: 'UNKNOWN',
                    queueStatus: 'UNKNOWN'
                },
                recentActivities: recentActivities || [],
                alerts: alerts || [],
                notifications: notifications || [],
                availableReports: availableReports || []
            };

            // Cache dashboard (5 minutes TTL)
            await this.cacheService.set(cacheKey, JSON.stringify(dashboard), 300);
            this.logger.log(`Admin dashboard cached for ${cacheKey}`);

            return dashboard;

        } catch (error) {
            this.logger.error(`Error building admin dashboard: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Failed to build admin dashboard',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}