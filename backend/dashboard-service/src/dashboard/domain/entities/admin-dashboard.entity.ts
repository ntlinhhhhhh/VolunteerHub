import { TopVolunteer } from "./event-manager-dashboard.entity";
import { Activity, CacheHealth, CategoryData, CityData, DatabaseHealth, DayData, EventCard, HourData, LocationData, MessageBusHealth, MonthlyData, NotificationItem, ServiceHealth, SystemAlert } from "./share.entity";
import { MetricPeriod, UserRole } from "./use-role.enum";

export interface AdminDashboard {
    userId: string;
    role: UserRole.ADMIN;
    period: MetricPeriod;

    // System Overview
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

    // Key Performance Indicators
    kpis: {
        // User KPIs
        userGrowthRate: number; // % month over month
        volunteerRetentionRate: number; // %
        volunteerChurnRate: number; // %
        averageVolunteerLifetime: number; // months

        // Event KPIs
        eventCompletionRate: number; // %
        averageEventAttendance: number; // %
        eventCancellationRate: number; // %

        // Engagement KPIs
        overallEngagementScore: number; // 0-100
        averageHoursPerVolunteer: number;
        volunteerSatisfactionScore: number; // 0-100

        // Financial KPIs
        costPerVolunteerRecruited: number;
        returnOnInvestment: number; // Monetary value / costs
        averageVolunteerValue: number; // per month
    };

    // User Analytics
    userAnalytics: {
        totalUsers: number;
        newUsersThisMonth: number;
        activeUsers: { day: number; week: number; month: number };
        usersByRole: { [key in UserRole]: number };
        topVolunteers: TopVolunteer[];
        inactiveUsers: InactiveUser[];
        userGrowthTrend: MonthlyData[];
    };

    // Event Analytics
    eventAnalytics: {
        totalEvents: number;
        eventsByStatus: { [key: string]: number };
        eventsCreatedThisMonth: number;
        upcomingEvents: EventCard[];
        mostPopularEvents: EventCard[];
        lowPerformingEvents: EventCard[];
        eventTrends: MonthlyData[];
        averageEventSize: number;
        averageEventDuration: number; // hours
    };

    // Registration Analytics
    registrationAnalytics: {
        totalRegistrations: number;
        registrationsThisMonth: number;
        registrationsByStatus: { [key: string]: number };
        averageTimeToApproval: number; // hours
        registrationConversionRate: number; // %
        registrationTrends: MonthlyData[];
    };

    // Engagement Analytics
    engagementAnalytics: {
        overallAttendanceRate: number;
        checkInRate: number; // % who checked in
        completionRate: number; // % who checked out
        averageSessionDuration: number; // minutes
        engagementByDayOfWeek: DayData[];
        engagementByTimeOfDay: HourData[];
    };

    // Geographic Analytics
    geographicAnalytics?: {
        volunteersByLocation: LocationData[];
        eventsByLocation: LocationData[];
        topCities: CityData[];
    };

    // Category Analytics
    categoryAnalytics: {
        popularCategories: CategoryData[];
        categoriesByVolunteerCount: CategoryData[];
        categoryTrends: MonthlyData[];
    };

    // System Health
    systemHealth: {
        status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
        services: ServiceHealth[];
        database: DatabaseHealth;
        cache: CacheHealth;
        messageBus: MessageBusHealth;
        apiResponseTime: number; // ms
        errorRate: number; // %
        uptime: number; // %
    };

    // Recent Activities (System-wide)
    recentActivities: Activity[];

    // System Alerts
    alerts: SystemAlert[];

    // Notifications
    notifications: NotificationItem[];

    // Predictive Analytics
    predictions?: {
        expectedVolunteersNextMonth: number;
        expectedEventsNextMonth: number;
        atRiskVolunteers: AtRiskVolunteer[];
        growthForecast: ForecastData[];
    };

    // Reports Available
    availableReports: ReportMetadata[];
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

export interface AtRiskVolunteer {
    id: string;
    name: string;
    churnRiskScore: number; // 0-100
    reasons: string[];
    lastActive: Date;
    recommendedActions: string[];
}

export interface ForecastData {
    month: string;
    predicted: number;
    confidence: number; // %
}

export interface ReportMetadata {
    id: string;
    name: string;
    description: string;
    category: string;
    lastGenerated: Date;
    downloadUrl: string;
}