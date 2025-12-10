import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../entities/notification-status.enum';
import { NotificationChannel } from '../entities/notification-channel.enum';

export interface INotificationRepository {
    findById(id: string): Promise<Notification | null>;
    findByUserId(userId: string, limit?: number, channel?: NotificationChannel): Promise<Notification[]>;
    create(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification>;
    updateStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<void>;
    markAsRead(id: string): Promise<void>;
    findPending(): Promise<Notification[]>;
    findFailed(): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
}

export const INotificationRepository = Symbol('INotificationRepository');