import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NotificationChannel } from '../../domain/entities/notification-channel.enum';

export class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    channel: NotificationChannel; // channel chính
    channels?: { inApp?: boolean; email?: string; push?: string }; // multi-channel
    subject: string;
    content: string;
    data?: Record<string, any>;
}
