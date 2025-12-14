import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MetricPeriod } from 'src/dashboard/domain/entities/shared';

@Schema({ timestamps: true, collection: 'admin_dashboards' })
export class AdminDashboard extends Document {
    @Prop({ required: true, enum: Object.values(MetricPeriod), index: true })
    period: MetricPeriod;

    @Prop({ type: Object, required: true })
    kpis: {
        systemOverview: {
            totalUsers: number;
            totalEvents: number;
            totalRegistrations: number;
            totalHoursVolunteered: number;
            activeUsers: number;
            systemUptime: number;
        };
        kpis: {
            userGrowthRate: number;
            eventCompletionRate: number;
            volunteerRetentionRate: number;
            averageEventRating: number;
            platformEngagementScore: number;
        };
    };

    @Prop({ type: Object, required: true })
    health: {
        status: string;
        services: any[];
        database: {
            status: string;
            connections: { active: number; max: number };
            queryPerformance: number;
            storage: { used: string; total: string };
        };
        cache: {
            status: string;
            hitRate: number;
            memoryUsage: number;
            evictions: number;
        };
        messageBus: {
            status: string;
            messagesQueued: number;
            processingRate: number;
            errorRate: number;
        };
        apiResponseTime: number;
        errorRate: number;
        uptime: number;
    };

    @Prop({ type: [Object], default: [] })
    alerts: any[];

    @Prop({ type: [Object], default: [] })
    notifications: any[];

    @Prop({ type: [Object], default: [] })
    reports: any[];

    @Prop({ type: [Object], default: [] })
    inactiveUsers: any[];

    @Prop({ type: [Object], default: [] })
    churnRisk: any[];

    @Prop({ type: Object, required: true })
    analytics: {
        userAnalytics: {
            byRole: any;
            byStatus: any;
            registrationTrend: any[];
            activeUsersTrend: any[];
            topVolunteers: any[];
            topEventManagers: any[];
        };
        eventAnalytics: {
            byStatus: any;
            byCategory: any;
            creationTrend: any[];
            completionTrend: any[];
            averageVolunteersPerEvent: number;
            mostPopularEvents: any[];
        };
        registrationAnalytics: {
            byStatus: any;
            registrationTrend: any[];
            attendanceRate: number;
            cancellationRate: number;
            averageHoursPerRegistration: number;
        };
        engagementAnalytics: {
            dailyActiveUsers: any[];
            monthlyActiveUsers: any[];
            averageSessionDuration: number;
            featureUsage: any;
            userRetention: any;
        };
    };

    @Prop({ type: Date, default: Date.now })
    lastUpdated: Date;
}

export const AdminDashboardSchema = SchemaFactory.createForClass(AdminDashboard);

// Indexes
AdminDashboardSchema.index({ period: 1 }, { unique: true });
AdminDashboardSchema.index({ lastUpdated: 1 });