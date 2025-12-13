import { Activity } from "./shared/activity.entity";
import { Achievement, Badge } from "./shared/badge.entity";
import { EventCard } from "./shared/event-card.entity";
import { MetricPeriod, MonthlyData, TrendData } from "./shared/metrics.entity";
import { NotificationItem } from "./shared/notification.entity";

export enum UserRole {
    VOLUNTEER = 'VOLUNTEER',
    EVENT_MANAGER = 'EVENT_MANAGER',
    ADMIN = 'ADMIN'
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