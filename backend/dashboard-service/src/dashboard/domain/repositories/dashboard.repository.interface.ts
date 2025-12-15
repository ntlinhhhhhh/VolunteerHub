import { CheckInCard, RegistrationCard, TopVolunteer } from "../entities/event-manager-dashboard.entity";
import { Achievement, Activity, Badge, ComparisonData, EventCard, MetricPeriod, MonthlyData, NotificationItem } from "../entities/shared";
import { InactiveUser, ForecastData, AtRiskVolunteer, SystemHealth, SystemAlert, ReportMetadata } from "../entities/admin-dashboard.entity";

export interface IDashboardRepository {
    // ==============================
    // Volunteer queries
    // ==============================
    getVolunteerMetrics(userId: string, period: MetricPeriod): Promise<any>;
    getVolunteerBadges(userId: string): Promise<Badge[]>;
    getVolunteerAchievements(userId: string): Promise<Achievement[]>;
    getVolunteerRank(userId: string): Promise<{ position: number; total: number }>;
    getVolunteerStreak(userId: string): Promise<{ current: number; longest: number }>;
    getRecommendedEvents(userId: string, limit: number): Promise<EventCard[]>;

    // ==============================
    // Manager queries
    // ==============================
    getManagerMetrics(userId: string, period: MetricPeriod): Promise<any>;
    getManagerEventPerformance(userId: string): Promise<any>;
    getManagerTopVolunteers(userId: string, limit: number): Promise<TopVolunteer[]>;
    getPendingApprovals(managerId: string): Promise<RegistrationCard[]>;
    getCheckInsToday(managerId: string): Promise<CheckInCard[]>;

    // ==============================
    // Admin queries
    // ==============================
    getSystemKPIs(period: MetricPeriod): Promise<any>;
    getSystemHealth(): Promise<SystemHealth>;
    getSystemAlerts(limit: number): Promise<SystemAlert[]>;
    getNotifications(userId: string, limit: number): Promise<NotificationItem[]>;
    getAvailableReports(): Promise<ReportMetadata[]>;
    getInactiveUsers(daysSince: number): Promise<InactiveUser[]>;
    predictChurnRisk(): Promise<AtRiskVolunteer[]>;
    getUserAnalytics(period: MetricPeriod): Promise<any>;
    getEventAnalytics(period: MetricPeriod): Promise<any>;
    getRegistrationAnalytics(period: MetricPeriod): Promise<any>;
    getEngagementAnalytics(period: MetricPeriod): Promise<any>;

    // ==============================
    // Shared queries
    // ==============================
    findRecentActivities(limit: number): Promise<Activity[]>;
    getMetricsComparison(userId: string, current: MetricPeriod, previous: MetricPeriod): Promise<ComparisonData>;
    getTrendData(metric: string, days: number): Promise<number[]>;
    getMonthlyTrends(metric: string, months: number): Promise<MonthlyData[]>;
}
