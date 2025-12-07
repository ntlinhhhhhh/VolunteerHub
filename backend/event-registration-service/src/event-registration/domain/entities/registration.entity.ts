import { RegistrationStatus } from './registration-status.enum';

export interface ApplicationForm {
    motivation: string;
    experience: string;
    skills: string[];
    availability: string;
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
}

export interface Approval {
    reviewedBy?: string;
    reviewedAt?: Date;
    rejectionReason?: string;
    acceptanceNote?: string;
}

export interface Attendance {
    checkInTime?: Date;
    checkInBy?: string;
    checkInLocation?: {
        lat: number;
        lng: number;
    };
    checkInMethod?: 'manual' | 'qr_code' | 'self';

    checkOutTime?: Date;
    checkOutBy?: string;
    checkOutMethod?: 'manual' | 'qr_code' | 'self';

    actualHours?: number;
    notes?: string;
}

export interface Completion {
    completedAt?: Date;
    certificateIssued?: boolean;
    certificateUrl?: string;

    // Volunteer rates event
    volunteerRating?: {
        stars: number;
        review: string;
        ratedAt: Date;
    };

    // Organizer rates volunteer
    organizerFeedback?: {
        performance: number;
        punctuality: number;
        teamwork: number;
        comment: string;
        ratedAt: Date;
    };
}

export class Registration {
    constructor(
        public readonly id: string,
        public readonly registrationCode: string,

        // Event info (cached from EVENT SERVICE)
        public readonly eventId: string,
        public readonly eventTitle: string,
        public readonly eventDate: Date,
        public readonly eventLocation: string,
        public readonly organizerId: string,
        public readonly organizerName: string,
        public readonly organizerEmail: string,

        // Volunteer info (cached from USER SERVICE)
        public readonly volunteerId: string,
        public readonly volunteerName: string,
        public readonly volunteerEmail: string,
        public readonly volunteerPhone: string,

        // Role
        public readonly roleId: string,
        public readonly roleName: string,

        // Status & Forms
        public readonly status: RegistrationStatus,
        public readonly applicationForm: ApplicationForm,
        public readonly approval: Approval,
        public readonly attendance: Attendance,
        public readonly completion: Completion,

        // Timestamps
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    // Business logic methods
    canBeAccepted(): boolean {
        return this.status === RegistrationStatus.PENDING;
    }

    canBeRejected(): boolean {
        return this.status === RegistrationStatus.PENDING;
    }

    canBeCancelled(): boolean {
        return [
            RegistrationStatus.PENDING,
            RegistrationStatus.ACCEPTED,
            RegistrationStatus.CONFIRMED,
        ].includes(this.status);
    }

    canCheckIn(): boolean {
        return [
            RegistrationStatus.ACCEPTED,
            RegistrationStatus.CONFIRMED,
        ].includes(this.status);
    }

    canCheckOut(): boolean {
        return this.status === RegistrationStatus.CHECKED_IN;
    }

    isActive(): boolean {
        return [
            RegistrationStatus.PENDING,
            RegistrationStatus.ACCEPTED,
            RegistrationStatus.CONFIRMED,
            RegistrationStatus.CHECKED_IN,
        ].includes(this.status);
    }

    canBeRated(): boolean {
        return this.status === RegistrationStatus.COMPLETED && !this.completion.volunteerRating;
    }

    calculateHours(): number {
        if (this.attendance.checkInTime && this.attendance.checkOutTime) {
            const diff = this.attendance.checkOutTime.getTime() - this.attendance.checkInTime.getTime();
            return Math.round((diff / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
        }
        return 0;
    }
}