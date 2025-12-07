import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventStatus } from '../../../domain/entities/event-status.enum';

export type EventDocument = Event & Document;

@Schema({ _id: false })
class Coordinates {
    @Prop({ required: true, min: -90, max: 90 })
    lat: number;

    @Prop({ required: true, min: -180, max: 180 })
    lng: number;
}

@Schema({ _id: false })
class Location {
    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    district: string;

    @Prop()
    ward?: string;

    @Prop({ type: Coordinates })
    coordinates?: Coordinates;
}

@Schema({ _id: false })
class Schedule {
    @Prop({ required: true, type: Date })
    startDate: Date;

    @Prop({ required: true, type: Date })
    endDate: Date;

    @Prop({ required: true, type: Date })
    registrationDeadline: Date;
}

@Schema({ _id: false })
class Requirements {
    @Prop()
    minAge?: number;

    @Prop()
    maxAge?: number;

    @Prop({ type: [String], default: [] })
    skills: string[];

    @Prop()
    experience?: string;

    @Prop()
    healthRequirements?: string;
}

@Schema({ _id: false })
class Capacity {
    @Prop({ required: true })
    maxVolunteers: number;

    @Prop({ default: 0 })
    currentVolunteers: number;

    @Prop({ required: true })
    minVolunteers: number;
}

@Schema({ _id: false })
class Role {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    slots: number;

    @Prop({ default: 0 })
    filled: number;
}

@Schema({ _id: false })
class Approval {
    @Prop()
    approvedBy?: string;

    @Prop({ type: Date })
    approvedAt?: Date;

    @Prop()
    rejectionReason?: string;

    @Prop({ type: Date })
    reviewedAt?: Date;
}

@Schema({ _id: false })
class Media {
    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [String], default: [] })
    videos: string[];

    @Prop({ type: [String], default: [] })
    documents: string[];
}

@Schema({ collection: 'events', timestamps: true })
export class Event {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, unique: true, index: true })
    slug: string;

    @Prop({ required: true })
    description: string;

    // Organizer
    @Prop({ required: true, index: true })
    organizerId: string;

    @Prop({ required: true })
    organizerName: string;

    @Prop({ required: true })
    organizerEmail: string;

    @Prop({ default: '0969514248' })
    organizerPhone: string;

    // Category
    @Prop({ required: true, index: true })
    categoryId: string;

    @Prop({ required: true })
    categoryName: string;

    // Location & Schedule
    @Prop({ type: Location, required: true })
    location: Location;

    @Prop({ type: Schedule, required: true })
    schedule: Schedule;

    // Requirements & Capacity
    @Prop({ type: Requirements })
    requirements: Requirements;

    @Prop({ type: Capacity, required: true })
    capacity: Capacity;

    @Prop({ type: [Role], default: [] })
    roles: Role[];

    // Status & Approval
    @Prop({ type: String, enum: EventStatus, default: EventStatus.DRAFT, index: true })
    status: EventStatus;

    @Prop({ type: Approval })
    approval: Approval;

    // Media & Meta
    @Prop({ type: Media })
    media: Media;

    @Prop({ type: String, enum: ['public', 'private'], default: 'public', index: true })
    visibility: string;

    @Prop({ default: false, index: true })
    featured: boolean;

    @Prop({ type: [String], default: [], index: true })
    tags: string[];

    createdAt: Date;
    updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes
EventSchema.index({ organizerId: 1, status: 1 });
EventSchema.index({ categoryId: 1, status: 1 });
EventSchema.index({ 'location.city': 1, 'location.district': 1 });
EventSchema.index({ 'schedule.startDate': 1 });
EventSchema.index({ 'schedule.registrationDeadline': 1 });
EventSchema.index({ title: 'text', description: 'text' });
EventSchema.index({ createdAt: -1 });
EventSchema.index({ featured: 1, status: 1 });
