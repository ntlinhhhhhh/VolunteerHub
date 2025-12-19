import { AtRiskVolunteer, InactiveUser } from "../entities/admin-dashboard.entity";
import { CheckInCard, ComparisonData, RegistrationCard, TopVolunteer } from "../entities/event-manager-dashboard.entity";
import { Activity, EventCard, MonthlyData } from "../entities/share.entity";
import { MetricPeriod } from "../entities/use-role.enum";
import { Achievement, Badge } from "../entities/volunteer-dashboard.entity";

export interface IDashboardRepository {
    // Existing methods (keep your current ones)
    findTrendingEvents(limit: number): Promise<any[]>;
    findRecentActivities(limit: number): Promise<Activity[]>;
    findUserStats(userId: string): Promise<any>;

    // NEW: Volunteer-specific queries
    getVolunteerMetrics(userId: string, period: MetricPeriod): Promise<any>;
    getVolunteerBadges(userId: string): Promise<Badge[]>;
    getVolunteerAchievements(userId: string): Promise<Achievement[]>;
    getVolunteerRank(userId: string): Promise<{ position: number; total: number }>;
    getVolunteerStreak(userId: string): Promise<{ current: number; longest: number }>;
    getRecommendedEvents(userId: string, limit: number): Promise<EventCard[]>;

    // NEW: Manager-specific queries
    getManagerMetrics(userId: string, period: MetricPeriod): Promise<any>;
    getManagerEventPerformance(userId: string): Promise<any>;
    getManagerTopVolunteers(userId: string, limit: number): Promise<TopVolunteer[]>;
    getPendingApprovals(managerId: string): Promise<RegistrationCard[]>;
    getCheckInsToday(managerId: string): Promise<CheckInCard[]>;

    // NEW: Admin-specific queries
    getSystemKPIs(period: MetricPeriod): Promise<any>;
    getUserAnalytics(period: MetricPeriod): Promise<any>;
    getEventAnalytics(period: MetricPeriod): Promise<any>;
    getRegistrationAnalytics(period: MetricPeriod): Promise<any>;
    getEngagementAnalytics(period: MetricPeriod): Promise<any>;
    getInactiveUsers(daysSince: number): Promise<InactiveUser[]>;
    predictChurnRisk(): Promise<AtRiskVolunteer[]>;

    // NEW: Comparison queries
    getMetricsComparison(userId: string, currentPeriod: MetricPeriod, previousPeriod: MetricPeriod): Promise<ComparisonData>;

    // NEW: Trend analysis
    getTrendData(metric: string, days: number): Promise<number[]>;
    getMonthlyTrends(metric: string, months: number): Promise<MonthlyData[]>;
}