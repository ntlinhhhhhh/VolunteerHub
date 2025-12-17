import { Feedback, FeedbackType } from '../entities/feedback.entity';

export interface FeedbackFilterOptions {
    eventId?: string;
    volunteerId?: string;
    managerId?: string;
    feedbackType?: FeedbackType;
    rating?: number;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IFeedbackRepository {
    // CRUD
    findById(id: string): Promise<Feedback | null>;
    findAll(options: FeedbackFilterOptions): Promise<PaginatedResult<Feedback>>;
    create(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback>;
    update(id: string, feedback: Partial<Feedback>): Promise<Feedback>;
    delete(id: string): Promise<void>;

    // Business queries
    findByEventId(eventId: string, options?: FeedbackFilterOptions): Promise<PaginatedResult<Feedback>>;
    findByVolunteerId(volunteerId: string, options?: FeedbackFilterOptions): Promise<PaginatedResult<Feedback>>;
    findByManagerId(managerId: string, options?: FeedbackFilterOptions): Promise<PaginatedResult<Feedback>>;
    findByEventAndVolunteer(eventId: string, volunteerId: string): Promise<Feedback | null>;

    // Statistics
    getAverageRatingForEvent(eventId: string): Promise<number | null>;
    getFeedbackCountForEvent(eventId: string): Promise<number>;
    getFeedbackCountForVolunteer(volunteerId: string): Promise<number>;
}

export const IFeedbackRepository = Symbol('IFeedbackRepository');