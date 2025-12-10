import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export enum NotificationType {
    // Event events
    NEW_EVENT_PENDING = 'new_event_pending',
    EVENT_CREATED = 'event_created',
    EVENT_APPROVED = 'event_approved',
    EVENT_REJECTED = 'event_rejected',
    EVENT_CANCELLED = 'event_cancelled',
}

export interface NotificationMessage {
    type: NotificationType;
    userId: string;
    channels: {
        inApp?: boolean;
        email?: string;
        push?: string;
    };
    data: Record<string, any>;
}


@Injectable()
export class MessagePublisherService {
    private readonly logger = new Logger(MessagePublisherService.name);
    constructor(private readonly amqpConnection: AmqpConnection) { }

    async notifyAdminsEventPending(adminId: string, adminEmail: string, data: any): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.NEW_EVENT_PENDING,
            userId: adminId,
            channels: {
                inApp: true,
                email: adminEmail,
            },
            data
        };

        try {
            await this.amqpConnection.publish(
                'notification_exchange',
                'admin.new_event_pending',
                message
            );
            this.logger.log(`Notification sent to admin: ${adminEmail}`);
        } catch (error) {
            this.logger.error(`Failed to publish notification to admin: ${adminEmail}`, error);
        }
    }

    async notifyEventManagerEventApproved(eventManagerId: string, eventManagerEmail: string, data: any): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.EVENT_APPROVED,
            userId: eventManagerId,
            channels: {
                inApp: true,
                email: eventManagerEmail,
            },
            data
        };

        try {
            await this.amqpConnection.publish(
                'notification_exchange',
                'event.event_approved',
                message
            );
            this.logger.log(`Notification sent to admin: ${eventManagerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to publish notification to admin: ${eventManagerEmail}`, error);
        }
    }

    async notifyEventManagerEventRejected(eventManagerId: string, eventManagerEmail: string, data: any): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.EVENT_REJECTED,
            userId: eventManagerId,
            channels: {
                inApp: true,
                email: eventManagerEmail,
            },
            data
        };

        try {
            await this.amqpConnection.publish(
                'notification_exchange',
                'event.event_rejected',
                message
            );
            this.logger.log(`Notification sent to admin: ${eventManagerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to publish notification to admin: ${eventManagerEmail}`, error);
        }
    }

    async notifyEventManagerEventCancelled(eventManagerId: string, eventManagerEmail: string, data: any): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.EVENT_CANCELLED,
            userId: eventManagerId,
            channels: {
                inApp: true,
                email: eventManagerEmail,
            },
            data
        };

        try {
            await this.amqpConnection.publish(
                'notification_exchange',
                'event.event_cancelled',
                message
            );
            this.logger.log(`Notification sent to admin: ${eventManagerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to publish notification to admin: ${eventManagerEmail}`, error);
        }
    }



}