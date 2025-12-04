import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventCategoryDocument = EventCategory & Document;

@Schema({ collection: 'event_categories', timestamps: true })
export class EventCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  color: string;

  @Prop({ index: true, default: null })
  parentId: string | null;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const EventCategorySchema = SchemaFactory.createForClass(EventCategory);

// Indexes
EventCategorySchema.index({ isActive: 1, order: 1 });
EventCategorySchema.index({ parentId: 1 });