import { Registration } from '../entities/registration.entity';
import { RegistrationStatus } from '../entities/registration-status.enum';

export interface RegistrationFilterOptions {
    eventId?: string;
    volunteerId?: string;
    organizerId?: string;
    status?: RegistrationStatus;
    roleId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'eventDate' | 'checkInTime';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IRegistrationRepository {
    // CRUD
    findById(id: string): Promise<Registration | null>;
    findByCode(code: string): Promise<Registration | null>;
    findAll(options: RegistrationFilterOptions): Promise<PaginatedResult<Registration>>;
    create(registration: Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Registration>;
    update(id: string, data: Partial<Registration>): Promise<Registration>;
    delete(id: string): Promise<void>;

    // Queries
    findByEventId(eventId: string, options?: RegistrationFilterOptions): Promise<PaginatedResult<Registration>>;
    findByVolunteerId(volunteerId: string, options?: RegistrationFilterOptions): Promise<PaginatedResult<Registration>>;
    findByStatus(status: RegistrationStatus): Promise<Registration[]>;

    // Check duplicates
    findExistingRegistration(eventId: string, volunteerId: string): Promise<Registration | null>;
    countByEventAndStatus(eventId: string, status: RegistrationStatus): Promise<number>;

    // Statistics
    countByStatus(status: RegistrationStatus): Promise<number>;
    countByVolunteer(volunteerId: string): Promise<number>;
    getTotalHoursByVolunteer(volunteerId: string): Promise<number>;
    getUpcomingRegistrations(volunteerId: string, limit?: number): Promise<Registration[]>;

    // Updates
    updateStatus(id: string, status: RegistrationStatus): Promise<void>;
    bulkUpdateStatusByEvent(eventId: string, fromStatus: RegistrationStatus, toStatus: RegistrationStatus): Promise<void>;
    updateVolunteerInfo(volunteerId: string, data: Partial<{
        volunteerName: string;
        volunteerEmail: string;
        volunteerPhone: string;
    }>): Promise<void>;
}

export const IRegistrationRepository = Symbol('IRegistrationRepository');