import { EventStatus } from './event-status.enum';

export interface EventLocation {
    address: string;
    city: string;
    district: string;
    ward?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface EventSchedule {
    startDate: Date;
    endDate: Date;
    registrationDeadline: Date;
}

export interface EventRequirements {
    minAge?: number;
    maxAge?: number;
    skills: string[];
    experience?: string;
    healthRequirements?: string;
}

export interface EventCapacity {
    maxVolunteers: number;
    currentVolunteers: number;
    minVolunteers: number;
}

export interface EventRole {
    id: string;
    name: string;
    description: string;
    slots: number;
    filled: number;
}

export interface EventApproval {
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    reviewedAt?: Date;
}

export interface EventMedia {
    images: string[];
    videos: string[];
    documents: string[];
}

export class Event {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly slug: string,
        public readonly description: string,

        // Organizer info (cached from USER SERVICE) - event-manager
        public readonly organizerId: string,
        public readonly organizerName: string,
        public readonly organizerEmail: string,
        public readonly organizerPhone: string,

        // Category
        public readonly categoryId: string,
        public readonly categoryName: string,

        // Location & Schedule
        public readonly location: EventLocation,
        public readonly schedule: EventSchedule,

        // Requirements & Capacity
        public readonly requirements: EventRequirements,
        public readonly capacity: EventCapacity,
        public readonly roles: EventRole[],

        // Status & Approval
        public readonly status: EventStatus,
        public readonly approval: EventApproval,

        // Media & Meta
        public readonly media: EventMedia,
        public readonly visibility: 'public' | 'private',
        public readonly featured: boolean,
        public readonly tags: string[],

        // Timestamps
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    // Business logic methods
    canBePublished(): boolean {
        return this.status === EventStatus.APPROVED;
    }

    canBeEdited(): boolean {
        return [
            EventStatus.DRAFT,
            EventStatus.REJECTED,
            EventStatus.APPROVED,
        ].includes(this.status);
    }

    canBeCancelled(): boolean {
        return ![
            EventStatus.COMPLETED,
            EventStatus.CANCELLED,
        ].includes(this.status);
    }

    isPublic(): boolean {
        return this.visibility === 'public' &&
            this.status === EventStatus.PUBLISHED;
    }

    isFull(): boolean {
        return this.capacity.currentVolunteers >= this.capacity.maxVolunteers;
    }

    canAcceptMoreVolunteers(): boolean {
        return !this.isFull() &&
            this.status === EventStatus.PUBLISHED &&
            new Date() < this.schedule.registrationDeadline;
    }

    isRegistrationOpen(): boolean {
        const now = new Date();
        return this.status === EventStatus.PUBLISHED &&
            now < this.schedule.registrationDeadline &&
            !this.isFull();
    }

    // Update methods (return new instance - immutable)
    updateStatus(newStatus: EventStatus): Event {
        return new Event(
            this.id,
            this.title,
            this.slug,
            this.description,
            this.organizerId,
            this.organizerName,
            this.organizerEmail,
            this.organizerPhone,
            this.categoryId,
            this.categoryName,
            this.location,
            this.schedule,
            this.requirements,
            this.capacity,
            this.roles,
            newStatus,
            this.approval,
            this.media,
            this.visibility,
            this.featured,
            this.tags,
            this.createdAt,
            new Date()
        );
    }

    incrementVolunteerCount(): Event {
        return new Event(
            this.id,
            this.title,
            this.slug,
            this.description,
            this.organizerId,
            this.organizerName,
            this.organizerEmail,
            this.organizerPhone,
            this.categoryId,
            this.categoryName,
            this.location,
            this.schedule,
            this.requirements,
            {
                ...this.capacity,
                currentVolunteers: this.capacity.currentVolunteers + 1,
            },
            this.roles,
            this.status,
            this.approval,
            this.media,
            this.visibility,
            this.featured,
            this.tags,
            this.createdAt,
            new Date()
        );
    }

    decrementVolunteerCount(): Event {
        return new Event(
            this.id,
            this.title,
            this.slug,
            this.description,
            this.organizerId,
            this.organizerName,
            this.organizerEmail,
            this.organizerPhone,
            this.categoryId,
            this.categoryName,
            this.location,
            this.schedule,
            this.requirements,
            {
                ...this.capacity,
                currentVolunteers: Math.max(0, this.capacity.currentVolunteers - 1),
            },
            this.roles,
            this.status,
            this.approval,
            this.media,
            this.visibility,
            this.featured,
            this.tags,
            this.createdAt,
            new Date()
        );
    }
}