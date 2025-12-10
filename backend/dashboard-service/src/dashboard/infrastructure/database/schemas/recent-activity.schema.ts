import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActivityType } from '../../../domain/entities/recent-activity.entity';

export type RecentActivityDocument = RecentActivity & Document;

@Schema({ collection: 'recent_activities', timestamps: true })
export class RecentActivity {
  @Prop({ type: String, enum: ActivityType, required: true })
  type: ActivityType;

  @Prop({ required: true })
  actorId: string;

  @Prop({ required: true })
  actorName: string;

  @Prop({ required: true })
  targetId: string;

  @Prop({ required: true })
  targetName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: () => new Date() })
  timestamp: Date;

  createdAt: Date;
}

export const RecentActivitySchema = SchemaFactory.createForClass(RecentActivity);

// Indexes
RecentActivitySchema.index({ timestamp: -1 });
RecentActivitySchema.index({ type: 1 });
RecentActivitySchema.index({ actorId: 1 });
