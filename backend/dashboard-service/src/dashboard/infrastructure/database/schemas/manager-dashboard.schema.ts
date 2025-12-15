import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MetricPeriod } from 'src/dashboard/domain/entities/shared';

@Schema({ timestamps: true, collection: 'manager_dashboards' })
export class ManagerDashboard extends Document {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, enum: Object.values(MetricPeriod), index: true })
    period: MetricPeriod;

    @Prop({ type: Object, required: true })
    metrics: {
        overview: {
            totalEvents: number;
            activeEvents: number;
            completedEvents: number;
            totalVolunteers: number;
            totalHoursManaged: number;
            averageAttendanceRate: number;
        };
        eventMetrics: {
            published: number;
            draft: number;
            ongoing: number;
            completed: number;
            cancelled: number;
            averageVolunteersPerEvent: number;
            averageDuration: number;
            fillRate: number;
        };
        myEvents: {
            draft: any[];
            published: any[];
            ongoing: any[];
            completed: any[];
            needsAttention: any[];
        };
        volunteers: {
            total: number;
            active: number;
            inactive: number;
        };
        recentRegistrations: any[];
        checkInsToday: any[];
        TrendData: any[];
        comparison: {
            vsLastMonth: any;
            vsLastYear: any;
        };
        recentActivities: any[];
        notifications: any[];
        insights: {
            bestPerformingEvents: any[];
            volunteerEngagementScore: number;
            recruitmentEffectiveness: number;
            suggestedImprovements: string[];
        };
        eventPerformance?: any;
    };

    @Prop({ type: [Object], default: [] })
    topVolunteers: any[];

    @Prop({ type: [Object], default: [] })
    pendingApprovals: any[];

    @Prop({ type: [Object], default: [] })
    checkInsToday: any[];

    @Prop({ type: Date, default: Date.now })
    lastUpdated: Date;
}

export const ManagerDashboardSchema = SchemaFactory.createForClass(ManagerDashboard);

// Compound indexes
ManagerDashboardSchema.index({ userId: 1, period: 1 }, { unique: true });
ManagerDashboardSchema.index({ lastUpdated: 1 });