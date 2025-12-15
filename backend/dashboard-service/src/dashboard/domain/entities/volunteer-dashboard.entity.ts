import { EventCard, Badge, Achievement, Activity, NotificationItem, MetricPeriod } from './shared';
import { MonthlyData, TrendData } from './shared/metrics.entity';

// ✅ FIX: Sửa lỗi chính tả trong enum
export enum UserRole {
    VOLUNTEER = 'volunteer',
    EVENT_MANAGER = 'event_manager',  // ✅ Đã sửa từ 'event_mager'
    ADMIN = 'admin'
}

export interface VolunteerDashboard {
    userId: string;
    role: UserRole.VOLUNTEER;
    period: MetricPeriod;
    overview: {
        totalHoursVolunteered: number;
        monetaryValue: number;
        eventsRegistered: number;
        eventsCompleted: number;
        upcomingEvents: number;
        completionRate: number;
        attendanceRate: number;
        averageHoursPerEvent: number;
        streak: { current: number; longest: number };
    };
    gamification: {
        currentLevel: number;
        pointsEarned: number;
        pointsToNextLevel: number;
        badges: Badge[];
        rank: { position: number; total: number };
        achievements: Achievement[];
    };
    myEvents: {
        registered: EventCard[];
        inProgress: EventCard[];
        completed: EventCard[];
        needAction: EventCard[];
    };
    trends: {
        hoursPerMonth: MonthlyData[];
        eventsPerMonth: MonthlyData[];
        attendanceTrend: TrendData;
    };
    recentActivities: Activity[];
    notifications: NotificationItem[];
    unreadMessages: number;
    recommendedEvents: EventCard[];
    impact: {
        totalPeopleHelped: number;
        totalProjectsCompleted: number;
        topSkillsUsed: string[];
        favoriteCauses: string[];
    };
}