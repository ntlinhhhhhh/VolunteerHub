import { Activity, EventCard, MonthlyData, NotificationItem, TrendData } from "./share.entity";
import { MetricPeriod, UserRole } from "./use-role.enum";

export interface VolunteerDashboard {
    userId: string;
    role: UserRole.VOLUNTEER;
    period: MetricPeriod;

    // Overview Stats
    overview: {
        totalHoursVolunteered: number;
        monetaryValue: number; // hours * $31.80
        eventsRegistered: number;
        eventsCompleted: number;
        upcomingEvents: number;
        completionRate: number; // %
        attendanceRate: number; // %
        averageHoursPerEvent: number;
        streak: { current: number; longest: number }; // consecutive events
    };

    // Gamification & Recognition
    gamification: {
        currentLevel: number;
        pointsEarned: number;
        pointsToNextLevel: number;
        badges: Badge[];
        rank: { position: number; total: number }; // Leaderboard position
        achievements: Achievement[];
    };

    // My Events
    myEvents: {
        registered: EventCard[];
        inProgress: EventCard[];
        completed: EventCard[];
        needAction: EventCard[]; // Need check-in, feedback, etc.
    };

    // Performance Trends
    trends: {
        hoursPerMonth: MonthlyData[];
        eventsPerMonth: MonthlyData[];
        attendanceTrend: TrendData;
    };

    // Recent Activities
    recentActivities: Activity[];

    // Notifications & Messages
    notifications: NotificationItem[];
    unreadMessages: number;

    // Recommended Events (Based on skills, interests, past participation)
    recommendedEvents: EventCard[];

    // Impact Summary
    impact: {
        totalPeopleHelped: number;
        totalProjectsCompleted: number;
        topSkillsUsed: string[];
        favoriteCauses: string[];
    };
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    earnedAt: Date;
    progress?: { current: number; target: number };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: 'HOURS' | 'EVENTS' | 'STREAK' | 'IMPACT' | 'SPECIAL';
    completedAt: Date;
    reward?: { points: number; badge?: string };
}