import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'dashboard_snapshots',
    timestamps: true,
})
export class DashboardSnapshot {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true })
    role: string;

    @Prop({ required: true })
    period: string;

    @Prop({ type: Object, required: true })
    data: any;

    @Prop({ type: Date, default: Date.now })
    snapshotAt: Date;

    @Prop({ type: Date, index: true })
    expiresAt: Date;
}

export type DashboardSnapshotDocument = DashboardSnapshot & Document;
export const DashboardSnapshotSchema =
    SchemaFactory.createForClass(DashboardSnapshot);
