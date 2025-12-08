import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RegistrationStatus } from '../../../domain/entities/registration-status.enum';

export type RegistrationDocument = Registration & Document;

@Schema({ _id: false })
class ApplicationForm {
    @Prop({ required: true })
    motivation: string;

    @Prop()
    experience: string;

    @Prop({ type: [String], default: [] })
    skills: string[];

    @Prop({ required: true })
    availability: string;

    @Prop({ type: Object, required: true })
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
}

@Schema({ _id: false })
class Approval {
    @Prop()
    reviewedBy?: string;

    @Prop({ type: Date })
    reviewedAt?: Date;

    @Prop()
    rejectionReason?: string;

    @Prop()
    acceptanceNote?: string;
}

@Schema({ _id: false })
class Attendance {
    @Prop({ type: Date })
    checkInTime?: Date;

    @Prop()
    checkInBy?: string;

    @Prop({ type: Object })
    checkInLocation?: {
        lat: number;
        lng: number;
    };

    @Prop({ type: String, enum: ['manual', 'qr_code', 'self'] })
    checkInMethod?: string;

    @Prop({ type: Date })
    checkOutTime?: Date;

    @Prop()
    checkOutBy?: string;

    @Prop({ type: String, enum: ['manual', 'qr_code', 'self'] })
    checkOutMethod?: string;

    @Prop({ type: Number })
    actualHours?: number;

    @Prop()
    notes?: string;
}

@Schema({ _id: false })
class VolunteerRating {
    @Prop({ type: Number, min: 1, max: 5 })
    stars: number;

    @Prop()
    review: string;

    @Prop({ type: Date })
    ratedAt: Date;
}

@Schema({ _id: false })
class OrganizerFeedback {
    @Prop({ type: Number, min: 1, max: 5 })
    performance: number;

    @Prop({ type: Number, min: 1, max: 5 })
    punctuality: number;

    @Prop({ type: Number, min: 1, max: 5 })
    teamwork: number;

    @Prop()
    comment: string;

    @Prop({ type: Date })
    ratedAt: Date;
}

@Schema({ _id: false })
class Completion {
    @Prop({ type: Date })
    completedAt?: Date;

    @Prop({ default: false })
    certificateIssued?: boolean;

    @Prop()
    certificateUrl?: string;

    @Prop({ type: VolunteerRating })
    volunteerRating?: VolunteerRating;

    @Prop({ type: OrganizerFeedback })
    organizerFeedback?: OrganizerFeedback;
}

@Schema({ collection: 'registrations', timestamps: true })
export class Registration {
    @Prop({ required: true, unique: true, index: true })
    registrationCode: string;

    // Event info (cached from EVENT SERVICE)
    @Prop({ required: true, index: true })
    eventId: string;

    @Prop({ required: true })
    eventTitle: string;

    @Prop({ required: true, type: Date, index: true })
    eventDate: Date;

    @Prop({ required: true })
    eventLocation: string;

    @Prop({ required: true, index: true })
    organizerId: string;

    @Prop({ required: true })
    organizerName: string;

    @Prop({ required: true })
    organizerEmail: string;

    // Volunteer info (cached from USER SERVICE)
    @Prop({ required: true, index: true })
    volunteerId: string;

    @Prop({ required: true })
    volunteerName: string;

    @Prop({ required: true })
    volunteerEmail: string;

    @Prop({ required: true })
    volunteerPhone: string;

    // Role
    @Prop({ required: true })
    roleId: string;

    @Prop({ required: true })
    roleName: string;

    // Status
    @Prop({
        type: String,
        enum: RegistrationStatus,
        default: RegistrationStatus.PENDING,
        index: true,
    })
    status: RegistrationStatus;

    // Forms & Details
    @Prop({ type: ApplicationForm, required: true })
    applicationForm: ApplicationForm;

    @Prop({ type: Approval })
    approval: Approval;

    @Prop({ type: Attendance })
    attendance: Attendance;

    @Prop({ type: Completion })
    completion: Completion;

    createdAt: Date;
    updatedAt: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Indexes
RegistrationSchema.index({ eventId: 1, volunteerId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, status: 1 });
RegistrationSchema.index({ volunteerId: 1, status: 1 });
RegistrationSchema.index({ organizerId: 1, status: 1 });
RegistrationSchema.index({ eventId: 1, roleId: 1 });
RegistrationSchema.index({ eventDate: 1, status: 1 });
RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ 'attendance.checkInTime': 1 });