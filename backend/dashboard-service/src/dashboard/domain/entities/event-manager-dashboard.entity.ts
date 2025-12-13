import { Activity } from './shared/activity.entity';
import { EventCard } from './shared/event-card.entity';
import { ComparisonData, MetricPeriod, TrendData } from './shared/metrics.entity';
import { NotificationItem, PendingAction } from './shared/notification.entity';
import { UserRole } from './volunteer-dashboard.entity';

export interface EventManagerDashboard {
    userId: string;
    role: UserRole.EVENT_MANAGER;
    period: MetricPeriod;

    overview: {
        totalEvents: number;
        activeEvents: number;
        completedEvents: number;
        totalVolunteers: number;
        totalVolunteerHours: number;
        monetaryValue: number;
        averageAttendanceRate: number;
        averageEventRating: number;
        pendingApprovals: number;
    };

    eventMetrics: {
        registrationRate: number;
        showUpRate: number;
        completionRate: number;
        volunteerRetentionRate: number;
        averageHoursPerEvent: number;
    };

    myEvents: {
        draft: EventCard[];
        published: EventCard[];
        ongoing: EventCard[];
        completed: EventCard[];
        needsAttention: EventCard[];
    };

    volunteers: {
        total: number;
        active: number;
        inactive: number;
        topPerformers: TopVolunteer[];
        recentRegistrations: RegistrationCard[];
        checkInsToday: CheckInCard[];
        attendanceTrends: TrendData;
    };

    comparison: {
        vsLastMonth: ComparisonData;
        vsLastYear: ComparisonData;
    };

    pendingActions: PendingAction[];
    recentActivities: Activity[];
    notifications: NotificationItem[];

    insights: {
        bestPerformingEvents: EventCard[];
        volunteerEngagementScore: number;
        recruitmentEffectiveness: number;
        suggestedImprovements: string[];
    };
}

export interface TopVolunteer {
    id: string;
    name: string;
    avatar?: string;
    totalHours: number;
    eventsCompleted: number;
    attendanceRate: number;
    rating: number;
    skills: string[];
    lastActive: Date;
}

export interface RegistrationCard {
    id: string;
    volunteerId: string;
    volunteerName: string;
    volunteerAvatar?: string;
    volunteerSkills: string[];
    eventId: string;
    eventTitle: string;
    registeredAt: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    matchScore?: number;
}

export interface CheckInCard {
    id: string;
    volunteerId: string;
    volunteerName: string;
    eventId: string;
    eventTitle: string;
    checkInTime: Date;
    checkOutTime?: Date;
    hoursWorked?: number;
    status: 'CHECKED_IN' | 'CHECKED_OUT';
}