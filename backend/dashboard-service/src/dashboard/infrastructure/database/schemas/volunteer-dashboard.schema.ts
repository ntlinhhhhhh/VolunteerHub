import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MetricPeriod } from 'src/dashboard/domain/entities/shared';

@Schema({ timestamps: true, collection: 'volunteer_dashboards' })
export class VolunteerDashboard extends Document {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, enum: Object.values(MetricPeriod), index: true })
    period: MetricPeriod;

    @Prop({ type: Object, required: true })
    metrics: {
        totalHours: number;
        eventsRegistered: number;
        eventsCompleted: number;
        upcomingEvents: number;
        volunteersAttended: number;
        volunteersRegistered: number;
        averageHoursPerEvent: number;
        totalPoints: number;
        myEvents: any;
        hoursPerMonth: any[];
        eventsPerMonth: any[];
        attendanceSparkline: number[];
        recentActivities: any[];
        notifications: any[];
        unreadMessages: number;
        recommendedEvents: any[];
        impact: any;
        attendanceRate?: number;
    };

    @Prop({ type: [Object], default: [] })
    badges: any[];

    @Prop({ type: [Object], default: [] })
    achievements: any[];

    @Prop({ type: Object, required: true })
    rank: {
        position: number;
        total: number;
    };

    @Prop({ type: Object, required: true })
    streak: {
        current: number;
        longest: number;
    };

    @Prop({ type: Date, default: Date.now })
    lastUpdated: Date;
}

export const VolunteerDashboardSchema = SchemaFactory.createForClass(VolunteerDashboard);

// Compound indexes for performance
VolunteerDashboardSchema.index({ userId: 1, period: 1 }, { unique: true });
VolunteerDashboardSchema.index({ lastUpdated: 1 });