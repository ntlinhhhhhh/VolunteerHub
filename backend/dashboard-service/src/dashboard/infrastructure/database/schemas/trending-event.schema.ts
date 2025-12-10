import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrendingEventDocument = TrendingEvent & Document;

@Schema({ collection: 'trending_events', timestamps: true })
export class TrendingEvent {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true })
  eventDate: Date;

  @Prop({ required: true })
  eventLocation: string;

  @Prop({ default: 0 })
  registrationCount: number;

  @Prop({ default: () => new Date() })
  lastActivityTimestamp: Date;

  @Prop({ default: 0 })
  trendScore: number;

  createdAt: Date;
  updatedAt: Date;
}

export const TrendingEventSchema = SchemaFactory.createForClass(TrendingEvent);

// Indexes
TrendingEventSchema.index({ trendScore: -1 });
TrendingEventSchema.index({ eventId: 1 });
TrendingEventSchema.index({ lastActivityTimestamp: -1 });