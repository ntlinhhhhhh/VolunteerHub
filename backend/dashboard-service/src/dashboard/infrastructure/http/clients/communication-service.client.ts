import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHttpClient } from './base-http.client';

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    subject?: string;
    content: string;
    read: boolean;
    sentAt: Date;
    readAt?: Date;
}

export interface MessageStats {
    totalSent: number;
    totalReceived: number;
    unreadCount: number;
}

@Injectable()
export class CommunicationServiceClient extends BaseHttpClient {
    constructor(configService: ConfigService) {
        super(
            configService,
            configService.get<string>('COMMUNICATION_SERVICE_URL') || 'http://localhost:8000/communication-service',
            'CommunicationService'
        );
    }

    /**
     * Lấy messages của user
     */
    async getUserMessages(userId: string, limit: number = 20, token?: string): Promise<Message[]> {
        if (token) this.setAuthToken(token);
        
        return this.get<Message[]>(`/api/v1/messages/user/${userId}?limit=${limit}`);
    }

    /**
     * Lấy unread message count
     */
    async getUnreadCount(userId: string, token?: string): Promise<number> {
        if (token) this.setAuthToken(token);
        
        const response = await this.get<{ count: number }>(`/api/v1/messages/user/${userId}/unread-count`);
        return response.count;
    }

    /**
     * Lấy message engagement rate
     */
    async getMessageEngagementRate(userId: string, token?: string): Promise<number> {
        if (token) this.setAuthToken(token);
        
        const response = await this.get<{ rate: number }>(`/api/v1/messages/user/${userId}/engagement-rate`);
        return response.rate;
    }

    /**
     * Send message
     */
    async sendMessage(message: Partial<Message>, token?: string): Promise<Message> {
        if (token) this.setAuthToken(token);
        
        return this.post<Message>(`/api/v1/messages`, message);
    }

    /**
     * Get message stats
     */
    async getMessageStats(userId: string, token?: string): Promise<MessageStats> {
        if (token) this.setAuthToken(token);
        
        return this.get<MessageStats>(`/api/v1/messages/user/${userId}/stats`);
    }
}
