import { EventManagerDashboard } from '../../domain/entities/event-manager-dashboard.entity';
import { GetEventManagerDashboardDto } from '../dto/event-manager-dashboard.dto';
import { PendingAction } from '../../domain/entities/shared';
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import type { ICacheService } from '../..//domain/repositories/dashboard-cache.repository.interface';
import { UserRole } from 'src/dashboard/domain/entities/volunteer-dashboard.entity';

@Injectable()
export class GetEventManagerDashboardUseCase {
    private readonly logger = new Logger(GetEventManagerDashboardUseCase.name);

    constructor(
        @Inject('IDashboardRepository')
        private readonly dashboardRepository: IDashboardRepository,
        @Inject('ICacheService')
        private readonly cacheService: ICacheService
    ) { }

    async execute(dto: GetEventManagerDashboardDto): Promise<EventManagerDashboard> {
        try {
            const cacheKey = `dashboard:manager:${dto.userId}:${dto.period}`;

            // Check cache
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                this.logger.log(`Cache HIT for ${cacheKey}`);
                return JSON.parse(cached);
            }

            this.logger.log(`Cache MISS for ${cacheKey}, building dashboard...`);

            // Fetch data from repository in parallel
            const [metrics, topVolunteers, pendingApprovals] = await Promise.all([
                this.dashboardRepository.getManagerMetrics(dto.userId, dto.period),
                this.dashboardRepository.getManagerTopVolunteers(dto.userId, 10),
                this.dashboardRepository.getPendingApprovals(dto.userId),
            ]);

            if (!metrics) {
                throw new HttpException(
                    `No data found for manager ${dto.userId}`,
                    HttpStatus.NOT_FOUND
                );
            }

            // Map RegistrationCard[] to PendingAction[]
            const pendingActions: PendingAction[] = pendingApprovals.map(registration => ({
                id: registration.id,
                type: 'APPROVAL_NEEDED',
                title: `Approve registration for ${registration.volunteerName}`,
                description: `Volunteer ${registration.volunteerName} registered for event "${registration.eventTitle}"`,
                priority: 'HIGH',
                eventId: registration.eventId,
                volunteerId: registration.volunteerId,
                dueDate: new Date(),
                actionUrl: `/events/${registration.eventId}/registrations/${registration.id}/approve`
            }));

            // Build comprehensive dashboard
            const dashboard: EventManagerDashboard = {
                userId: dto.userId,
                role: UserRole.EVENT_MANAGER,
                period: dto.period,
                overview: metrics.overview || {
                    totalEvents: 0,
                    activeEvents: 0,
                    completedEvents: 0,
                    totalVolunteers: 0,
                    totalHoursManaged: 0,
                    averageAttendanceRate: 0
                },
                eventMetrics: metrics.eventMetrics || {
                    published: 0,
                    draft: 0,
                    ongoing: 0,
                    completed: 0,
                    cancelled: 0,
                    averageVolunteersPerEvent: 0,
                    averageDuration: 0,
                    fillRate: 0
                },
                myEvents: metrics.myEvents || {
                    draft: [],
                    published: [],
                    ongoing: [],
                    completed: [],
                    needsAttention: []
                },
                volunteers: {
                    total: metrics.volunteers?.total || 0,
                    active: metrics.volunteers?.active || 0,
                    inactive: metrics.volunteers?.inactive || 0,
                    topPerformers: topVolunteers,
                    recentRegistrations: metrics.recentRegistrations || [],
                    checkInsToday: metrics.checkInsToday || [],
                    attendanceTrends: metrics.TrendData || []
                },
                comparison: metrics.comparison || {
                    vsLastMonth: {
                        events: { current: 0, previous: 0, change: 0 },
                        volunteers: { current: 0, previous: 0, change: 0 },
                        hours: { current: 0, previous: 0, change: 0 },
                        attendance: { current: 0, previous: 0, change: 0 }
                    },
                    vsLastYear: {
                        events: { current: 0, previous: 0, change: 0 },
                        volunteers: { current: 0, previous: 0, change: 0 },
                        hours: { current: 0, previous: 0, change: 0 },
                        attendance: { current: 0, previous: 0, change: 0 }
                    }
                },
                pendingActions,
                recentActivities: metrics.recentActivities || [],
                notifications: metrics.notifications || [],
                insights: metrics.insights || {
                    bestPerformingEvents: [],
                    volunteerEngagementScore: 0,
                    recruitmentEffectiveness: 0,
                    suggestedImprovements: []
                }
            };

            // Cache dashboard (5 minutes TTL)
            await this.cacheService.set(cacheKey, JSON.stringify(dashboard), 300);
            this.logger.log(`Dashboard cached for ${cacheKey}`);

            return dashboard;

        } catch (error) {
            this.logger.error(`Error building manager dashboard: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Failed to build event manager dashboard',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}