import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHttpClient } from './base-http.client';

export interface Registration {
    id: string;
    userId: string;
    eventId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
    registeredAt: Date;
    approvedAt?: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
    hoursWorked?: number;
    attended: boolean;
    feedback?: string;
    rating?: number;
}

export interface RegistrationStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    attended: number;
    completionRate: number;
    averageRating: number;
}

@Injectable()
export class RegistrationServiceClient extends BaseHttpClient {
    constructor(configService: ConfigService) {
        super(
            configService,
            configService.get<string>('REGISTRATION_SERVICE_URL') || 'http://localhost:8000/registration-service',
            'RegistrationService'
        );
    }

    /**
     * Lấy registrations của user
     */
    async getUserRegistrations(userId: string, token?: string): Promise<Registration[]> {
        if (token) this.setAuthToken(token);
        
        return this.get<Registration[]>(`/api/v1/registrations/user/${userId}`);
    }

    /**
     * Lấy registrations của event
     */
    async getEventRegistrations(eventId: string, token?: string): Promise<Registration[]> {
        if (token) this.setAuthToken(token);
        
        return this.get<Registration[]>(`/api/v1/registrations/event/${eventId}`);
    }

    /**
     * Lấy registration stats
     */
    async getRegistrationStats(eventId: string, token?: string): Promise<RegistrationStats> {
        if (token) this.setAuthToken(token);
        
        return this.get<RegistrationStats>(`/api/v1/registrations/event/${eventId}/stats`);
    }

    /**
     * Lấy pending registrations của manager
     */
    async getPendingRegistrations(managerId: string, token?: string): Promise<Registration[]> {
        if (token) this.setAuthToken(token);
        
        return this.get<Registration[]>(`/api/v1/registrations/pending?managerId=${managerId}`);
    }

    /**
     * Lấy registration theo ID
     */
    async getRegistrationById(registrationId: string, token?: string): Promise<Registration> {
        if (token) this.setAuthToken(token);
        
        return this.get<Registration>(`/api/v1/registrations/${registrationId}`);
    }

    /**
     * Get check-ins today
     */
    async getCheckInsToday(managerId: string, token?: string): Promise<Registration[]> {
        if (token) this.setAuthToken(token);
        
        const today = new Date().toISOString().split('T')[0];
        return this.get<Registration[]>(
            `/api/v1/registrations/check-ins?managerId=${managerId}&date=${today}`
        );
    }
}
