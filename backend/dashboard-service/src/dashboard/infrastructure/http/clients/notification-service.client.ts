import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHttpClient } from './base-http.client';

export interface Notification {
    id: string;
    userId: string;
    type: 'EVENT_REMINDER' | 'REGISTRATION_UPDATE' | 'EVENT_CANCELLED' | 'ACHIEVEMENT' | 'BADGE_EARNED' | 'MESSAGE' | 'SYSTEM';
    title: string;
    message: string;
    read: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actionUrl?: string;
    createdAt: Date;
}

@Injectable()
export class NotificationServiceClient extends BaseHttpClient {
    constructor(configService: ConfigService) {
        super(
            configService,
            configService.get<string>('NOTIFICATION_SERVICE_URL') || 'http://localhost:8000/notification-service',
            'NotificationService'
        );
    }

    /**
     * Lấy notifications của user
     */
    async getUserNotifications(userId: string, limit: number = 20, token?: string): Promise<Notification[]> {
        if (token) this.setAuthToken(token);
        
        return this.get<Notification[]>(`/api/v1/notifications/user/${userId}?limit=${limit}`);
    }

    /**
     * Lấy unread notifications count
     */
    async getUnreadCount(userId: string, token?: string): Promise<number> {
        if (token) this.setAuthToken(token);
        
        const response = await this.get<{ count: number }>(`/api/v1/notifications/user/${userId}/unread-count`);
        return response.count;
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, token?: string): Promise<void> {
        if (token) this.setAuthToken(token);
        
        await this.patch(`/api/v1/notifications/${notificationId}/read`, {});
    }

    /**
     * Send notification (admin)
     */
    async sendNotification(notification: Partial<Notification>, token?: string): Promise<Notification> {
        if (token) this.setAuthToken(token);
        
        return this.post<Notification>(`/api/v1/notifications`, notification);
    }
}
