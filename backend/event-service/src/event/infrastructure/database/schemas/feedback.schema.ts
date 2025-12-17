import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FeedbackType } from '../../../domain/entities/feedback.entity';

export type FeedbackDocument = Feedback & Document;

@Schema({ collection: 'feedbacks', timestamps: true })
export class Feedback {
    @Prop({ required: true, index: true })
    eventId: string;

    @Prop({ required: true, index: true })
    volunteerId: string;

    @Prop({ index: true })
    managerId?: string;

    @Prop({ required: true, type: String, enum: FeedbackType, index: true })
    feedbackType: FeedbackType;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop()
    comment?: string;

    createdAt: Date;
    updatedAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Indexes
FeedbackSchema.index({ eventId: 1, volunteerId: 1, feedbackType: 1 }, { unique: true }); // One feedback per volunteer per event per type
FeedbackSchema.index({ eventId: 1, createdAt: -1 });
FeedbackSchema.index({ volunteerId: 1, createdAt: -1 });
FeedbackSchema.index({ managerId: 1, createdAt: -1 });
FeedbackSchema.index({ feedbackType: 1 });
FeedbackSchema.index({ rating: 1 });