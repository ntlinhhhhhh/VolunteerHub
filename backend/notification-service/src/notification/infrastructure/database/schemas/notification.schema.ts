/**
 * GIẢI THÍCH:
 * MongoDB Schema cho Notification.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NotificationType } from '../../../domain/entities/notification-type.enum';
import { NotificationChannel } from '../../../domain/entities/notification-channel.enum';
import { NotificationStatus } from '../../../domain/entities/notification-status.enum';

export type NotificationDocument = Notification & Document;

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ required: true})
  userId: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: String, enum: NotificationChannel, required: true })
  channel: NotificationChannel;

  @Prop({ type: String, enum: NotificationStatus, default: NotificationStatus.PENDING})
  status: NotificationStatus;

  @Prop({ required: true })
  recipient: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ default: null })
  sentAt: Date;

  @Prop({ default: null })
  readAt: Date;

  @Prop({ default: null })
  errorMessage: string;

  @Prop({ default: 0 })
  retryCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ type: 1 });
