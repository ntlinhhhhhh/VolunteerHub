import { NotificationType } from './notification-type.enum';
import { NotificationChannel } from './notification-channel.enum';
import { NotificationStatus } from './notification-status.enum';

export class Notification {
    constructor(
        public readonly id: string,
        public readonly userId: string,           // Người nhận
        public readonly type: NotificationType,
        public readonly channel: NotificationChannel,
        public readonly status: NotificationStatus,
        public readonly recipient: string,        // address email or phone number
        public readonly subject: string,
        public readonly content: string,
        public readonly data: Record<string, any>, // Metadata (event name, etc.)
        public readonly sentAt: Date | null,
        public readonly readAt: Date | null,
        public readonly errorMessage: string | null,
        public readonly retryCount: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    isSent(): boolean {
        return this.status === NotificationStatus.SENT;
    }

    isFailed(): boolean {
        return this.status === NotificationStatus.FAILED;
    }

    canRetry(): boolean {
        return this.status === NotificationStatus.FAILED && this.retryCount < 3;
    }

    markAsSent() {
        return new Notification(
            this.id,
            this.userId,
            this.type,
            this.channel,
            NotificationStatus.SENT,
            this.recipient,
            this.subject,
            this.content,
            this.data,
            new Date(),
            this.readAt,
            null,
            this.retryCount,
            this.createdAt,
            new Date()
        );
    }

    markAsRead() {
        return new Notification(
            this.id,
            this.userId,
            this.type,
            this.channel,
            NotificationStatus.READ,
            this.recipient,
            this.subject,
            this.content,
            this.data,
            this.sentAt,
            new Date(),
            this.errorMessage,
            this.retryCount,
            this.createdAt,
            new Date()
        );
    }
}