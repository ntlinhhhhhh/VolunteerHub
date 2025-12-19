import { ActivityType } from "./recent-activity.entity";
import { UserRole } from "./use-role.enum";

export interface EventCard {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    category: string;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

    // Manager info
    managerId: string;
    managerName: string;
    managerAvatar?: string;

    // Stats
    volunteersNeeded: number;
    volunteersRegistered: number;
    volunteersAttended: number;
    registrationRate: number; // %
    attendanceRate: number; // %

    // Ratings
    averageRating?: number;
    totalReviews?: number;

    // Images
    coverImage?: string;

    // For volunteers
    myStatus?: 'NOT_REGISTERED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    myCheckIn?: Date;
    myCheckOut?: Date;
    myHoursWorked?: number;
    recommendationScore?: number; // 0-100, for recommended events
}

export interface Activity {
    id: string;
    type: ActivityType;
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    actorRole?: UserRole;
    targetId: string;
    targetName: string;
    targetType: 'EVENT' | 'USER' | 'POST' | 'COMMENT';
    description: string;
    metadata: Record<string, any>;
    timestamp: Date;
}

export interface NotificationItem {
    id: string;
    userId: string;
    type: 'EVENT_REMINDER' | 'REGISTRATION_UPDATE' | 'EVENT_CANCELLED' | 'ACHIEVEMENT' | 'BADGE_EARNED' | 'MESSAGE' | 'SYSTEM';
    title: string;
    message: string;
    read: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actionUrl?: string;
    createdAt: Date;
}

export interface PendingAction {
    id: string;
    type: 'APPROVAL_NEEDED' | 'CHECK_IN_PENDING' | 'FEEDBACK_NEEDED' | 'EVENT_PUBLISH' | 'LOW_REGISTRATION';
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    eventId?: string;
    volunteerId?: string;
    dueDate?: Date;
    actionUrl: string;
}

export interface MonthlyData {
    month: string; // 'YYYY-MM'
    value: number;
    change?: number; // % change from previous
}

export interface TrendData {
    current: number;
    previous: number;
    change: number; // %
    trend: 'UP' | 'DOWN' | 'STABLE';
    sparkline: number[]; // Last 7 or 30 data points
}

export interface DayData {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    value: number;
}

export interface HourData {
    hour: number; // 0-23
    value: number;
}

export interface LocationData {
    location: string;
    count: number;
    percentage: number;
}

export interface CityData {
    city: string;
    volunteers: number;
    events: number;
    totalHours: number;
}

export interface CategoryData {
    category: string;
    count: number;
    percentage: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
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
    queryPerformance: number; // ms average
    storage: { used: string; total: string };
}

export interface CacheHealth {
    status: 'UP' | 'DOWN';
    hitRate: number; // %
    memoryUsage: number; // %
    evictions: number;
}

export interface MessageBusHealth {
    status: 'UP' | 'DOWN';
    messagesQueued: number;
    processingRate: number; // messages/second
    errorRate: number; // %
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