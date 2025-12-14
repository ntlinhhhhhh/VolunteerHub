import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MetricPeriod } from '../../domain/entities/shared/metrics.entity';
import { UserRole } from '../../domain/entities/volunteer-dashboard.entity';
import { AdminDashboard, ManagerDashboard, VolunteerDashboard } from '../database/schemas';
import { UserServiceClient } from '../http/clients/user-service.client';
import { EventServiceClient } from '../http/clients/event-service.client';
import { RegistrationServiceClient } from '../http/clients/registration-service.client';
import { NotificationServiceClient } from '../http/clients/notification-service.client';
import { CommunicationServiceClient } from '../http/clients/communication-service.client';
import { Badge } from 'src/dashboard/domain/entities/shared';
import { BadgeEvaluatorService } from 'src/dashboard/domain/services/badge-evaluator.service';
import { ScoreCalculatorService } from 'src/dashboard/domain/services/score-calculator.service';
import { TrendAnalysisService } from 'src/dashboard/domain/services/trend-analysis.service';

@Injectable()
export class DashboardAggregationService {
    private readonly logger = new Logger(DashboardAggregationService.name);

    constructor(
        @InjectModel('VolunteerDashboard') private volunteerModel: Model<VolunteerDashboard>,
        @InjectModel('ManagerDashboard') private managerModel: Model<ManagerDashboard>,
        @InjectModel('AdminDashboard') private adminModel: Model<AdminDashboard>,
        private readonly userClient: UserServiceClient,
        private readonly eventClient: EventServiceClient,
        private readonly registrationClient: RegistrationServiceClient,
        private readonly notificationClient: NotificationServiceClient,
        private readonly communicationClient: CommunicationServiceClient,
        private readonly badgeEvaluator: BadgeEvaluatorService,
        private readonly scoreCalculator: ScoreCalculatorService,
        private readonly trendAnalysis: TrendAnalysisService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async aggregateAllDashboards() {
        this.logger.log('🔄 Starting dashboard aggregation...');
        try {
            const volunteers = await this.userClient.getUsersByRole(UserRole.VOLUNTEER);
            const managers = await this.userClient.getUsersByRole(UserRole.EVENT_MANAGER);

            await Promise.all([
                this.aggregateVolunteerDashboards(volunteers),
                this.aggregateManagerDashboards(managers),
                this.aggregateAdminDashboard(),
            ]);

            this.logger.log('✅ Dashboard aggregation completed successfully');
        } catch (error) {
            this.logger.error(`❌ Dashboard aggregation failed: ${error.message}`, error.stack);
        }
    }

    // ==================== BADGE CATALOG ====================
    private readonly BADGE_CATALOG: Record<string, { description: string; iconUrl: string; tier: Badge['tier'] }> = {
        NEWCOMER: { description: 'Hoàn thành sự kiện đầu tiên', iconUrl: '/icons/badges/newcomer.png', tier: 'BRONZE' },
        REGULAR: { description: 'Hoàn thành 5 sự kiện', iconUrl: '/icons/badges/regular.png', tier: 'SILVER' },
        DEDICATED: { description: 'Hoàn thành 10 sự kiện và 50 giờ tình nguyện', iconUrl: '/icons/badges/dedicated.png', tier: 'GOLD' },
        CHAMPION: { description: 'Hoàn thành 25 sự kiện và 100 giờ', iconUrl: '/icons/badges/champion.png', tier: 'PLATINUM' },
        LEGEND: { description: 'Hoàn thành 50 sự kiện và 250 giờ', iconUrl: '/icons/badges/legend.png', tier: 'PLATINUM' },
    };

    // ==================== Volunteer Dashboard ====================
    private async aggregateVolunteerDashboards(volunteers: any[]) {
        const periods = Object.values(MetricPeriod);
        for (const volunteer of volunteers) {
            for (const period of periods) {
                try {
                    const dashboard = await this.buildVolunteerDashboard(volunteer.id, period);
                    await this.volunteerModel.findOneAndUpdate(
                        { userId: volunteer.id, period },
                        { $set: dashboard },
                        { upsert: true, new: true }
                    );
                } catch (error) {
                    this.logger.error(`Failed to aggregate volunteer ${volunteer.id}: ${error.message}`);
                }
            }
        }
    }

    private async buildVolunteerDashboard(userId: string, period: MetricPeriod) {
        const [
            userProfile,
            registrations,
            notifications,
            unreadMessages,
            upcomingEvents,
        ] = await Promise.all([
            this.userClient.getUserProfile(userId),
            this.registrationClient.getUserRegistrations(userId),
            this.notificationClient.getUserNotifications(userId, 20),
            this.communicationClient.getUnreadCount(userId),
            this.eventClient.getUpcomingEvents(10),
        ]);

        const completed = registrations.filter(r => r.status === 'COMPLETED' && r.attended);
        const eventsCompleted = completed.length;
        const totalHours = completed.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
        const totalPoints = totalHours * 10; // Example: 10 points/hour
        const level = this.scoreCalculator.calculateLevel(totalPoints);
        const pointsToNextLevel = this.scoreCalculator.getPointsToNextLevel(totalPoints);

        // Badges
        const earnedBadgeNames = this.badgeEvaluator.evaluateBadges(eventsCompleted, totalHours);
        const badges: Badge[] = earnedBadgeNames.map(name => {
            const progress = this.badgeEvaluator.calculateProgress(eventsCompleted, totalHours);
            return this.createBadge({
                name,
                ...this.BADGE_CATALOG[name],
                progress
            });
        });

        // Trends
        const hoursPerMonth = await this.calculateHoursPerMonth(userId);
        const eventsPerMonth = await this.calculateEventsPerMonth(userId);
        const hourTrend = this.trendAnalysis.calculateTrendData(hoursPerMonth.map(h => h.hours));
        const eventTrend = this.trendAnalysis.calculateTrendData(eventsPerMonth.map(e => e.events));

        return {
            userId,
            period,
            metrics: {
                totalHours,
                eventsRegistered: registrations.length,
                eventsCompleted,
                totalPoints,
                level,
                pointsToNextLevel,
                badges,
                recentActivities: await this.getRecentActivities(userId),
                notifications,
                unreadMessages,
                recommendedEvents: upcomingEvents.slice(0, 5),
                hoursPerMonth,
                eventsPerMonth,
                hourTrend,
                eventTrend,
            },
            achievements: await this.calculateAchievements(userId, eventsCompleted),
            lastUpdated: new Date(),
        };
    }

    private async calculateHoursPerMonth(userId: string) {
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            return { month: `${d.getFullYear()}-${d.getMonth() + 1}`, hours: Math.floor(Math.random() * 20) };
        });
    }

    private async calculateEventsPerMonth(userId: string) {
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            return { month: `${d.getFullYear()}-${d.getMonth() + 1}`, events: Math.floor(Math.random() * 5) };
        });
    }

    private async getRecentActivities(userId: string) {
        return [
            { type: 'EVENT_JOINED', description: 'Joined a volunteer event', createdAt: new Date() },
            { type: 'EVENT_COMPLETED', description: 'Completed an event', createdAt: new Date(Date.now() - 86400000) },
        ];
    }

    private async calculateAchievements(userId: string, eventsCompleted: number): Promise<{ id: string; title: string; unlockedAt: Date }[]> {
        const achievements: { id: string; title: string; unlockedAt: Date }[] = [];

        if (eventsCompleted >= 1) {
            achievements.push({
                id: 'FIRST_EVENT',
                title: 'First Step',
                unlockedAt: new Date(),
            });
        }

        if (eventsCompleted >= 10) {
            achievements.push({
                id: 'TEN_EVENTS',
                title: 'Helping Hand',
                unlockedAt: new Date(),
            });
        }

        return achievements;
    }


    // ==================== Manager Dashboard ====================
    private async aggregateManagerDashboards(managers: any[]) {
        const periods = Object.values(MetricPeriod);
        for (const manager of managers) {
            for (const period of periods) {
                try {
                    const dashboard = await this.buildManagerDashboard(manager.id, period);
                    await this.managerModel.findOneAndUpdate(
                        { userId: manager.id, period },
                        { $set: dashboard },
                        { upsert: true, new: true }
                    );
                } catch (error) {
                    this.logger.error(`Failed to aggregate manager ${manager.id}: ${error.message}`);
                }
            }
        }
    }

    private async buildManagerDashboard(managerId: string, period: MetricPeriod) {
        const [
            managerEvents,
            pendingRegistrations,
            checkIns,
            notifications,
        ] = await Promise.all([
            this.eventClient.getEventsByManager(managerId),
            this.registrationClient.getPendingRegistrations(managerId),
            this.registrationClient.getCheckInsToday(managerId),
            this.notificationClient.getUserNotifications(managerId, 20),
        ]);

        const activeEvents = managerEvents.filter(e => ['PUBLISHED', 'ONGOING'].includes(e.status));
        const completedEvents = managerEvents.filter(e => e.status === 'COMPLETED');

        let totalVolunteers = 0;
        let totalHours = 0;
        for (const event of managerEvents) {
            const regs = await this.registrationClient.getEventRegistrations(event.id);
            totalVolunteers += regs.filter(r => r.status === 'APPROVED').length;
            totalHours += regs.filter(r => r.attended).reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
        }

        return {
            userId: managerId,
            period,
            metrics: {
                totalEvents: managerEvents.length,
                activeEvents: activeEvents.length,
                completedEvents: completedEvents.length,
                totalVolunteers,
                totalHoursManaged: totalHours,
                averageAttendanceRate: totalVolunteers > 0 ? (totalHours / totalVolunteers) : 0,
                recentRegistrations: pendingRegistrations.slice(0, 10),
                checkInsToday: checkIns,
                notifications,
            },
            lastUpdated: new Date(),
        };
    }

    // ==================== Admin Dashboard ====================
    private async aggregateAdminDashboard() {
        const periods = Object.values(MetricPeriod);
        for (const period of periods) {
            try {
                const dashboard = await this.buildAdminDashboard(period);
                await this.adminModel.findOneAndUpdate(
                    { period },
                    { $set: dashboard },
                    { upsert: true, new: true }
                );
            } catch (error) {
                this.logger.error(`Failed to aggregate admin dashboard: ${error.message}`);
            }
        }
    }

    private async buildAdminDashboard(period: MetricPeriod) {
        const [
            allUsers,
            allEvents,
            volunteers,
            managers,
        ] = await Promise.all([
            this.userClient.getUsersByRole('*'),
            this.eventClient.getAllEvents(),
            this.userClient.getUsersByRole(UserRole.VOLUNTEER),
            this.userClient.getUsersByRole(UserRole.EVENT_MANAGER),
        ]);

        const totalRegistrations = 0; // TODO: aggregate registrations
        const totalHours = 0; // TODO: aggregate hours

        return {
            period,
            kpis: {
                totalUsers: allUsers.length,
                totalEvents: allEvents.length,
                totalRegistrations,
                totalHoursVolunteered: totalHours,
                activeUsers: allUsers.length,
                systemUptime: 99.9,
            },
            userAnalytics: {
                byRole: {
                    volunteer: volunteers.length,
                    event_manager: managers.length,
                    admin: allUsers.filter(u => u.role === 'admin').length,
                },
            },
            eventAnalytics: {
                totalEvents: allEvents.length,
            },
            lastUpdated: new Date(),
        };
    }

    private createBadge(input: {
        name: string;
        description: string;
        iconUrl: string;
        tier: Badge['tier'];
        earnedAt?: Date;
        progress?: { current: number; target: number };
    }): Badge {
        return {
            id: `${input.name}_${input.tier}`,
            name: input.name,
            description: input.description,
            iconUrl: input.iconUrl,
            tier: input.tier,
            earnedAt: input.earnedAt ?? new Date(),
            progress: input.progress,
        };
    }

    private async calculateBadges(
        eventsCompleted: number,
        totalHours: number,
    ): Promise<Badge[]> {
        const earnedBadgeNames = this.badgeEvaluator.evaluateBadges(eventsCompleted, totalHours);

        const badges: Badge[] = earnedBadgeNames.map(name => {
            const progress = this.badgeEvaluator.calculateProgress(eventsCompleted, totalHours);
            return this.createBadge({ name, ...this.BADGE_CATALOG[name], progress });
        });

        return badges;
    }
}

