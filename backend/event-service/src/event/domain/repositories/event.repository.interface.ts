import { Event } from '../entities/event.entity';
import { EventStatus } from '../entities/event-status.enum';

export interface EventFilterOptions {
    status?: EventStatus;
    categoryId?: string;
    organizerId?: string;
    city?: string;
    district?: string;
    featured?: boolean;
    visibility?: 'public' | 'private';
    search?: string;
    startDateFrom?: Date;
    startDateTo?: Date;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'startDate' | 'title' | 'currentVolunteers';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IEventRepository {
    // CRUD
    findById(id: string): Promise<Event | null>;
    findBySlug(slug: string): Promise<Event | null>;
    findAll(options: EventFilterOptions): Promise<PaginatedResult<Event>>;
    create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event>;
    update(id: string, event: Partial<Event>): Promise<Event>;
    delete(id: string): Promise<void>;

    // Status queries
    findByStatus(status: EventStatus, limit?: number): Promise<Event[]>;
    findByOrganizer(organizerId: string, options?: EventFilterOptions): Promise<PaginatedResult<Event>>;
    findPendingApproval(): Promise<Event[]>;
    findPublished(options: EventFilterOptions): Promise<PaginatedResult<Event>>;
    findFeatured(limit?: number): Promise<Event[]>;

    // Business operations
    updateStatus(id: string, status: EventStatus): Promise<void>;
    incrementVolunteerCount(id: string): Promise<void>;
    decrementVolunteerCount(id: string): Promise<void>;
    updateOrganizerInfo(organizerId: string, organizerData: Partial<{
        organizerName: string;
        organizerEmail: string;
        organizerPhone: string;
    }>): Promise<void>;

    // Statistics
    countByStatus(status: EventStatus): Promise<number>;
    countByOrganizer(organizerId: string): Promise<number>;
    getUpcomingEvents(limit?: number): Promise<Event[]>;
    getPopularCategories(): Promise<Array<{ categoryId: string; categoryName: string; count: number }>>;
}

export const IEventRepository = Symbol('IEventRepository');