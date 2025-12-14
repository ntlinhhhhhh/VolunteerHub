import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHttpClient } from './base-http.client';

export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    category: string;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    managerId: string;
    managerName?: string;
    volunteersNeeded: number;
    volunteersRegistered: number;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventStats {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    averageRating: number;
}

@Injectable()
export class EventServiceClient extends BaseHttpClient {
    constructor(configService: ConfigService) {
        super(
            configService,
            configService.get<string>('EVENT_SERVICE_URL') || 'http://localhost:8000/event-service',
            'EventService'
        );
    }

    /**
     * Lấy event theo ID
     */
    async getEventById(eventId: string, token?: string): Promise<Event> {
        if (token) this.setAuthToken(token);

        return this.get<Event>(`/api/v1/events/${eventId}`);
    }

    /**
     * Lấy events do manager tạo
     */
    async getEventsByManager(managerId: string, token?: string): Promise<Event[]> {
        if (token) this.setAuthToken(token);

        return this.get<Event[]>(`/api/v1/events?managerId=${managerId}`);
    }

    /**
     * Lấy upcoming events
     */
    async getUpcomingEvents(limit: number = 10, token?: string): Promise<Event[]> {
        if (token) this.setAuthToken(token);

        return this.get<Event[]>(`/api/v1/events/upcoming?limit=${limit}`);
    }

    /**
     * Lấy events theo category
     */
    async getEventsByCategory(category: string, token?: string): Promise<Event[]> {
        if (token) this.setAuthToken(token);

        return this.get<Event[]>(`/api/v1/events?category=${category}`);
    }

    /**
     * Lấy event statistics
     */
    async getEventStats(eventId: string, token?: string): Promise<EventStats> {
        if (token) this.setAuthToken(token);

        return this.get<EventStats>(`/api/v1/events/${eventId}/stats`);
    }

    /**
     * Lấy tất cả events với filters
     */
    async getAllEvents(filters?: {
        status?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }, token?: string): Promise<Event[]> {
        if (token) this.setAuthToken(token);

        const params = new URLSearchParams(filters as any).toString();
        return this.get<Event[]>(`/api/v1/events?${params}`);
    }
}
