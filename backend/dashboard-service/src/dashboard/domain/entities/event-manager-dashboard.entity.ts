import { MetricPeriod, UserRole } from "./use-role.enum";
import { Activity, EventCard, NotificationItem, PendingAction, TrendData } from "./share.entity";


export interface EventManagerDashboard {
    userId: string;
    role: UserRole.EVENT_MANAGER;
    period: MetricPeriod;

    // Overview Stats
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

    // Event Performance Metrics
    eventMetrics: {
        registrationRate: number; // % of spots filled
        showUpRate: number; // % who actually attended
        completionRate: number; // % who checked out
        volunteerRetentionRate: number; // % returning volunteers
        averageHoursPerEvent: number;
    };

    // My Events Breakdown
    myEvents: {
        draft: EventCard[];
        published: EventCard[];
        ongoing: EventCard[];
        completed: EventCard[];
        needsAttention: EventCard[]; // Low registration, past deadline, etc.
    };

    // Volunteer Management
    volunteers: {
        total: number;
        active: number; // Active in last 30 days
        inactive: number;
        topPerformers: TopVolunteer[];
        recentRegistrations: RegistrationCard[];
        checkInsToday: CheckInCard[];
        attendanceTrends: TrendData;
    };

    // Performance Comparison
    comparison: {
        vsLastMonth: ComparisonData;
        vsLastYear: ComparisonData;
    };

    // Pending Actions (Priority sorted)
    pendingActions: PendingAction[];

    // Recent Activities
    recentActivities: Activity[];

    // Notifications
    notifications: NotificationItem[];

    // Analytics & Insights
    insights: {
        bestPerformingEvents: EventCard[];
        volunteerEngagementScore: number; // 0-100
        recruitmentEffectiveness: number; // %
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
    matchScore?: number; // % match with event requirements
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

export interface ComparisonData {
    events: { current: number; previous: number; change: number };
    volunteers: { current: number; previous: number; change: number };
    hours: { current: number; previous: number; change: number };
    attendance: { current: number; previous: number; change: number };
}