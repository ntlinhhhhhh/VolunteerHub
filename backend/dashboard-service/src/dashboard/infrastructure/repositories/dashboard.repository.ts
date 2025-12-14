// infrastructure/repositories/dashboard.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import {
    EventCard, Badge, Achievement, Activity, NotificationItem,
    MetricPeriod, MonthlyData, ComparisonData,
} from '../../domain/entities/shared';
import {
    TopVolunteer, CheckInCard, RegistrationCard,
} from '../../domain/entities/event-manager-dashboard.entity';
import {
    SystemHealth, SystemAlert, InactiveUser,
    AtRiskVolunteer, ReportMetadata,
} from '../../domain/entities/admin-dashboard.entity';
import { AdminDashboard, ManagerDashboard, VolunteerDashboard } from '../database/schemas';


@Injectable()
export class DashboardRepository implements IDashboardRepository {
    private readonly logger = new Logger(DashboardRepository.name);

    constructor(
        @InjectModel('VolunteerDashboard')
        private volunteerModel: Model<VolunteerDashboard>,
        @InjectModel('ManagerDashboard')
        private managerModel: Model<ManagerDashboard>,
        @InjectModel('AdminDashboard')
        private adminModel: Model<AdminDashboard>
    ) { }

    // ===================== Volunteer =====================
    async getVolunteerMetrics(userId: string, period: MetricPeriod) {
        try {
            const dashboard = await this.volunteerModel
                .findOne({ userId, period })
                .select('metrics')
                .lean<VolunteerDashboard>();

            return dashboard?.metrics || {};
        } catch (error) {
            this.logger.error(`Error fetching volunteer metrics: ${error.message}`);
            return {};
        }
    }

    async getVolunteerBadges(userId: string): Promise<Badge[]> {
        try {
            const dashboard = await this.volunteerModel
                .findOne({ userId })
                .select('badges')
                .lean<VolunteerDashboard>();

            return dashboard?.badges || [];
        } catch (error) {
            this.logger.error(`Error fetching volunteer badges: ${error.message}`);
            return [];
        }
    }

    async getVolunteerAchievements(userId: string): Promise<Achievement[]> {
        try {
            const dashboard = await this.volunteerModel
                .findOne({ userId })
                .select('achievements')
                .lean<VolunteerDashboard>();

            return dashboard?.achievements || [];
        } catch (error) {
            this.logger.error(`Error fetching volunteer achievements: ${error.message}`);
            return [];
        }
    }

    async getVolunteerRank(userId: string): Promise<{ position: number; total: number }> {
        try {
            const dashboard = await this.volunteerModel
                .findOne({ userId })
                .select('rank')
                .lean<VolunteerDashboard>();

            return dashboard?.rank || { position: 0, total: 0 };
        } catch (error) {
            this.logger.error(`Error fetching volunteer rank: ${error.message}`);
            return { position: 0, total: 0 };
        }
    }

    async getVolunteerStreak(userId: string): Promise<{ current: number; longest: number }> {
        try {
            const dashboard = await this.volunteerModel
                .findOne({ userId })
                .select('streak')
                .lean<VolunteerDashboard>();

            return dashboard?.streak || { current: 0, longest: 0 };
        } catch (error) {
            this.logger.error(`Error fetching volunteer streak: ${error.message}`);
            return { current: 0, longest: 0 };
        }
    }

    async getRecommendedEvents(userId: string, limit: number): Promise<EventCard[]> {
        try {
            const dashboard = await this.volunteerModel
                .findOne({ userId })
                .select('metrics.recommendedEvents')
                .lean<VolunteerDashboard>();

            return (dashboard?.metrics.recommendedEvents || []).slice(0, limit);
        } catch (error) {
            this.logger.error(`Error fetching recommended events: ${error.message}`);
            return [];
        }
    }

    // ===================== Manager =====================
    async getManagerMetrics(userId: string, period: MetricPeriod): Promise<any> {
        try {
            const dashboard = await this.managerModel
                .findOne({ userId, period })
                .select('metrics')
                .lean<ManagerDashboard>();

            return dashboard?.metrics || {};
        } catch (error) {
            this.logger.error(`Error fetching manager metrics: ${error.message}`);
            return {};
        }
    }

    async getManagerTopVolunteers(userId: string, limit: number): Promise<TopVolunteer[]> {
        try {
            const dashboard = await this.managerModel
                .findOne({ userId })
                .select('topVolunteers')
                .lean<ManagerDashboard>();

            return (dashboard?.topVolunteers || []).slice(0, limit);
        } catch (error) {
            this.logger.error(`Error fetching top volunteers: ${error.message}`);
            return [];
        }
    }

    async getPendingApprovals(managerId: string): Promise<RegistrationCard[]> {
        try {
            const dashboard = await this.managerModel
                .findOne({ userId: managerId })
                .select('pendingApprovals')
                .lean<ManagerDashboard>();

            return dashboard?.pendingApprovals || [];
        } catch (error) {
            this.logger.error(`Error fetching pending approvals: ${error.message}`);
            return [];
        }
    }

    async getCheckInsToday(managerId: string): Promise<CheckInCard[]> {
        try {
            const dashboard = await this.managerModel
                .findOne({ userId: managerId })
                .select('checkInsToday')
                .lean<ManagerDashboard>();

            return dashboard?.checkInsToday || [];
        } catch (error) {
            this.logger.error(`Error fetching check-ins: ${error.message}`);
            return [];
        }
    }

    async getManagerEventPerformance(userId: string): Promise<any> {
        try {
            const dashboard = await this.managerModel
                .findOne({ userId })
                .select('metrics.eventPerformance')
                .lean<ManagerDashboard>();

            return dashboard?.metrics?.eventPerformance || {};
        } catch (error) {
            this.logger.error(`Error fetching event performance: ${error.message}`);
            return {};
        }
    }

    // ===================== Admin =====================
    async getSystemKPIs(period: MetricPeriod): Promise<any> {
        try {
            const dashboard = await this.adminModel
                .findOne({ period })
                .select('kpis')
                .lean<AdminDashboard>();

            return dashboard?.kpis || {};
        } catch (error) {
            this.logger.error(`Error fetching system KPIs: ${error.message}`);
            return {};
        }
    }

    private normalizeSystemHealth(raw: any): SystemHealth {
        return {
            status:
                raw?.status === 'HEALTHY' ||
                    raw?.status === 'WARNING' ||
                    raw?.status === 'CRITICAL'
                    ? raw.status
                    : 'WARNING',

            services: raw?.services ?? [],

            database: raw?.database ?? {
                status: 'UP',
                connections: { active: 0, max: 0 },
                queryPerformance: 0,
                storage: { used: '0', total: '0' },
            },

            cache: raw?.cache ?? {
                status: 'UP',
                hitRate: 0,
                memoryUsage: 0,
                evictions: 0,
            },

            messageBus: raw?.messageBus ?? {
                status: 'UP',
                messagesQueued: 0,
                processingRate: 0,
                errorRate: 0,
            },

            apiResponseTime: raw?.apiResponseTime ?? 0,
            errorRate: raw?.errorRate ?? 0,
            uptime: raw?.uptime ?? 0,
        };
    }

    async getSystemHealth(): Promise<SystemHealth> {
        try {
            const dashboard = await this.adminModel
                .findOne()
                .select('health')
                .sort({ createdAt: -1 })
                .lean();

            if (dashboard?.health) {
                return this.normalizeSystemHealth(dashboard.health);
            }

            return this.normalizeSystemHealth(null);
        } catch (error) {
            this.logger.error(
                `Error fetching system health: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }


    async getSystemAlerts(limit: number): Promise<SystemAlert[]> {
        try {
            const dashboard = await this.adminModel
                .findOne()
                .select('alerts')
                .sort({ createdAt: -1 })
                .lean<AdminDashboard>();

            return (dashboard?.alerts || []).slice(0, limit);
        } catch (error) {
            this.logger.error(`Error fetching system alerts: ${error.message}`);
            return [];
        }
    }

    async getNotifications(userId: string, limit: number): Promise<NotificationItem[]> {
        try {
            const dashboard = await this.adminModel
                .findOne()
                .select('notifications')
                .sort({ createdAt: -1 })
                .lean<AdminDashboard>();

            return (dashboard?.notifications || []).slice(0, limit);
        } catch (error) {
            this.logger.error(`Error fetching notifications: ${error.message}`);
            return [];
        }
    }

    async getAvailableReports(): Promise<ReportMetadata[]> {
        try {
            const dashboard = await this.adminModel
                .findOne()
                .select('reports')
                .sort({ createdAt: -1 })
                .lean<AdminDashboard>();

            return dashboard?.reports || [];
        } catch (error) {
            this.logger.error(`Error fetching reports: ${error.message}`);
            return [];
        }
    }

    async getInactiveUsers(daysSince: number): Promise<InactiveUser[]> {
        try {
            const dashboard = await this.adminModel
                .findOne()
                .select('inactiveUsers')
                .sort({ createdAt: -1 })
                .lean<AdminDashboard>();

            return dashboard?.inactiveUsers || [];
        } catch (error) {
            this.logger.error(`Error fetching inactive users: ${error.message}`);
            return [];
        }
    }

    async predictChurnRisk(): Promise<AtRiskVolunteer[]> {
        try {
            const dashboard = await this.adminModel
                .findOne()
                .select('churnRisk')
                .sort({ createdAt: -1 })
                .lean<AdminDashboard>();

            return dashboard?.churnRisk || [];
        } catch (error) {
            this.logger.error(`Error fetching churn risk: ${error.message}`);
            return [];
        }
    }

    async getUserAnalytics(period: MetricPeriod): Promise<any> {
        try {
            const dashboard = await this.adminModel
                .findOne({ period })
                .select('analytics.userAnalytics')
                .lean<AdminDashboard>();

            return dashboard?.analytics?.userAnalytics || {};
        } catch (error) {
            this.logger.error(`Error fetching user analytics: ${error.message}`);
            return {};
        }
    }

    async getEventAnalytics(period: MetricPeriod): Promise<any> {
        try {
            const dashboard = await this.adminModel
                .findOne({ period })
                .select('analytics.eventAnalytics')
                .lean<AdminDashboard>();

            return dashboard?.analytics?.eventAnalytics || {};
        } catch (error) {
            this.logger.error(`Error fetching event analytics: ${error.message}`);
            return {};
        }
    }

    async getRegistrationAnalytics(period: MetricPeriod): Promise<any> {
        try {
            const dashboard = await this.adminModel
                .findOne({ period })
                .select('analytics.registrationAnalytics')
                .lean<AdminDashboard>();

            return dashboard?.analytics?.registrationAnalytics || {};
        } catch (error) {
            this.logger.error(`Error fetching registration analytics: ${error.message}`);
            return {};
        }
    }

    async getEngagementAnalytics(period: MetricPeriod): Promise<any> {
        try {
            const dashboard = await this.adminModel
                .findOne({ period })
                .select('analytics.engagementAnalytics')
                .lean<AdminDashboard>();

            return dashboard?.analytics?.engagementAnalytics || {};
        } catch (error) {
            this.logger.error(`Error fetching engagement analytics: ${error.message}`);
            return {};
        }
    }

    async findRecentActivities(limit: number): Promise<Activity[]> {
        try {
            const dashboard = await this.volunteerModel
                .findOne()
                .select('metrics.recentActivities')
                .sort({ createdAt: -1 })
                .lean<VolunteerDashboard>();

            return (dashboard?.metrics.recentActivities || []).slice(0, limit);
        } catch (error) {
            this.logger.error(`Error fetching recent activities: ${error.message}`);
            return [];
        }
    }

    async getMetricsComparison(
        userId: string,
        current: MetricPeriod,
        previous: MetricPeriod
    ): Promise<ComparisonData> {
        try {
            const [dashboardCurrent, dashboardPrevious] = await Promise.all([
                this.volunteerModel.findOne({ userId, period: current }).select('metrics').lean<VolunteerDashboard>(),
                this.volunteerModel.findOne({ userId, period: previous }).select('metrics').lean<VolunteerDashboard>()
            ]);

            const getMetrics = (metrics: any) => ({
                eventsCompleted: metrics?.eventsCompleted ?? 0,
                volunteersAttended: metrics?.volunteersAttended ?? 0,
                totalHours: metrics?.totalHours ?? 0,
                attendanceRate: metrics?.attendanceRate ?? 0,
            });

            const currentMetrics = getMetrics(dashboardCurrent?.metrics);
            const previousMetrics = getMetrics(dashboardPrevious?.metrics);

            const calcChange = (current: number, previous: number) => current - previous;

            return {
                events: {
                    current: currentMetrics.eventsCompleted,
                    previous: previousMetrics.eventsCompleted,
                    change: calcChange(currentMetrics.eventsCompleted, previousMetrics.eventsCompleted),
                },
                volunteers: {
                    current: currentMetrics.volunteersAttended,
                    previous: previousMetrics.volunteersAttended,
                    change: calcChange(currentMetrics.volunteersAttended, previousMetrics.volunteersAttended),
                },
                hours: {
                    current: currentMetrics.totalHours,
                    previous: previousMetrics.totalHours,
                    change: calcChange(currentMetrics.totalHours, previousMetrics.totalHours),
                },
                attendance: {
                    current: currentMetrics.attendanceRate,
                    previous: previousMetrics.attendanceRate,
                    change: calcChange(currentMetrics.attendanceRate, previousMetrics.attendanceRate),
                },
            };
        } catch (error) {
            this.logger.error(`Error fetching metrics comparison: ${error.message}`);
            throw error;
        }
    }

    async getTrendData(metric: string, days: number): Promise<number[]> {
        try {
            const dashboard = await this.volunteerModel
                .findOne()
                .select(`metrics.${metric}`)
                .lean<VolunteerDashboard>();

            return dashboard?.metrics?.[metric] || [];
        } catch (error) {
            this.logger.error(`Error fetching trend data: ${error.message}`);
            return [];
        }
    }

    async getMonthlyTrends(metric: string, months: number): Promise<MonthlyData[]> {
        try {
            const dashboard = await this.volunteerModel
                .findOne()
                .select(`metrics.${metric}`)
                .lean<VolunteerDashboard>();

            return dashboard?.metrics?.[metric] || [];
        } catch (error) {
            this.logger.error(`Error fetching monthly trends: ${error.message}`);
            return [];
        }
    }
}