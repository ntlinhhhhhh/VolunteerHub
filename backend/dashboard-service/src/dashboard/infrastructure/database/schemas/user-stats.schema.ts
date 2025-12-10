import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserStatsDocument = UserStats & Document;

@Schema({ collection: 'user_stats', timestamps: true })
export class UserStats {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: 0 })
  totalEventsCreated: number;

  @Prop({ default: 0 })
  totalEventsJoined: number;

  @Prop({ default: 0 })
  totalEventsCompleted: number;

  @Prop({ default: 0 })
  totalPostsCreated: number;

  @Prop({ default: 0 })
  totalCommentsCreated: number;

  @Prop({ default: () => new Date() })
  lastActivityAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);

// Indexes
UserStatsSchema.index({ userId: 1 });
UserStatsSchema.index({ lastActivityAt: -1 });