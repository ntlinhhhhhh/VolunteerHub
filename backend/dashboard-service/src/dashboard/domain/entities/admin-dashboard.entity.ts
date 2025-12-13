import { UserRole } from './volunteer-dashboard.entity';
import { TopVolunteer } from './event-manager-dashboard.entity';
import { MetricPeriod, MonthlyData } from './shared/metrics.entity';
import { Activity } from './shared/activity.entity';
import { NotificationItem } from './shared/notification.entity';
import { EventCard } from './shared/event-card.entity';

export interface AdminDashboard {
    userId: string;
    role: UserRole.ADMIN;
    period: MetricPeriod;

    systemOverview: {
        totalUsers: number;
        totalVolunteers: number;
        totalEventManagers: number;
        totalEvents: number;
        totalRegistrations: number;
        totalVolunteerHours: number;
        totalMonetaryValue: number;
        activeUsers24h: number;
        activeEvents: number;
    };

    kpis: SystemKPIs;
    userAnalytics: UserAnalytics;
    eventAnalytics: EventAnalytics;
    registrationAnalytics: RegistrationAnalytics;
    engagementAnalytics: EngagementAnalytics;
    systemHealth: SystemHealth;

    recentActivities: Activity[];
    alerts: SystemAlert[];
    notifications: NotificationItem[];
    predictions?: PredictiveAnalytics;
    availableReports: ReportMetadata[];
}

export interface SystemKPIs {
    userGrowthRate: number;
    volunteerRetentionRate: number;
    volunteerChurnRate: number;
    averageVolunteerLifetime: number;
    eventCompletionRate: number;
    averageEventAttendance: number;
    eventCancellationRate: number;
    overallEngagementScore: number;
    averageHoursPerVolunteer: number;
    volunteerSatisfactionScore: number;
    costPerVolunteerRecruited: number;
    returnOnInvestment: number;
    averageVolunteerValue: number;
}

export interface UserAnalytics {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: { day: number; week: number; month: number };
    usersByRole: Record<string, number>;
    topVolunteers: TopVolunteer[];
    inactiveUsers: InactiveUser[];
    userGrowthTrend: MonthlyData[];
}

export interface EventAnalytics {
    totalEvents: number;
    eventsByStatus: Record<string, number>;
    eventsCreatedThisMonth: number;
    upcomingEvents: EventCard[];
    mostPopularEvents: EventCard[];
    lowPerformingEvents: EventCard[];
    eventTrends: MonthlyData[];
    averageEventSize: number;
    averageEventDuration: number;
}

export interface RegistrationAnalytics {
    totalRegistrations: number;
    registrationsThisMonth: number;
    registrationsByStatus: Record<string, number>;
    averageTimeToApproval: number;
    registrationConversionRate: number;
    registrationTrends: MonthlyData[];
}

export interface EngagementAnalytics {
    overallAttendanceRate: number;
    checkInRate: number;
    completionRate: number;
    averageSessionDuration: number;
    engagementByDayOfWeek: DayData[];
    engagementByTimeOfDay: HourData[];
}

export interface InactiveUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastActive: Date;
    daysSinceActive: number;
    totalPastEvents: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DayData {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    value: number;
}

export interface HourData {
    hour: number;
    value: number;
}

export interface SystemHealth {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    services: ServiceHealth[];
    database: DatabaseHealth;
    cache: CacheHealth;
    messageBus: MessageBusHealth;
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
}

export interface ServiceHealth {
    name: string;
    status: 'UP' | 'DOWN' | 'DEGRADED';
    responseTime: number;
    errorRate: number;
    lastChecked: Date;
}

export interface DatabaseHealth {
    status: 'UP' | 'DOWN';
    connections: { active: number; max: number };
    queryPerformance: number;
    storage: { used: string; total: string };
}

export interface CacheHealth {
    status: 'UP' | 'DOWN';
    hitRate: number;
    memoryUsage: number;
    evictions: number;
}

export interface MessageBusHealth {
    status: 'UP' | 'DOWN';
    messagesQueued: number;
    processingRate: number;
    errorRate: number;
}

export interface SystemAlert {
    id: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    service: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
    resolvedAt?: Date;
}

export interface PredictiveAnalytics {
    expectedVolunteersNextMonth: number;
    expectedEventsNextMonth: number;
    atRiskVolunteers: AtRiskVolunteer[];
    growthForecast: ForecastData[];
}

export interface AtRiskVolunteer {
    id: string;
    name: string;
    churnRiskScore: number;
    reasons: string[];
    lastActive: Date;
    recommendedActions: string[];
}

export interface ForecastData {
    month: string;
    predicted: number;
    confidence: number;
}

export interface ReportMetadata {
    id: string;
    name: string;
    description: string;
    category: string;
    lastGenerated: Date;
    downloadUrl: string;
}