import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export enum NotificationType {
    // Registration events
    REGISTRATION_SUBMITTED = 'registration_submitted',
    REGISTRATION_ACCEPTED = 'registration_accepted',
    REGISTRATION_REJECTED = 'registration_rejected',
    // REGISTRATION_COMPLETED = 'registration_completed',
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

    async notifyEventManagerRegistrationSubmited(eventManagerId: string, eventManagerEmail: string, data: any): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.REGISTRATION_SUBMITTED,
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
                'registration.registration_submitted',
                message
            );
            this.logger.log(`Notification sent to admin: ${eventManagerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to publish notification to admin: ${eventManagerEmail}`, error);
        }
    }

    async notifyVolunteerRegistrationAccepted(volunteerId: string, volunteerEmail: string, data: any): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.REGISTRATION_ACCEPTED,
            userId: volunteerId,
            channels: {
                inApp: true,
                email: volunteerEmail,
            },
            data
        };

        try {
            await this.amqpConnection.publish(
                'notification_exchange',
                'registration.registration_accepted',
                message
            );
            this.logger.log(`Notification sent to admin: ${volunteerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to publish notification to admin: ${volunteerEmail}`, error);
        }
    }

    async notifyVolunteerRegistrationRejected(volunteerId: string, volunteerEmail: string, data: any): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.REGISTRATION_REJECTED,
            userId: volunteerId,
            channels: {
                inApp: true,
                email: volunteerEmail,
            },
            data
        };

        try {
            await this.amqpConnection.publish(
                'notification_exchange',
                'event.event_rejected',
                message
            );
            this.logger.log(`Notification sent to admin: ${volunteerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to publish notification to admin: ${volunteerEmail}`, error);
        }
    }

    // async notifyEventManagerEventCancelled(eventManagerId: string, eventManagerEmail: string, data: any): Promise<void> {
    //     const message: NotificationMessage = {
    //         type: NotificationType.EVENT_CANCELLED,
    //         userId: eventManagerId,
    //         channels: {
    //             inApp: true,
    //             email: eventManagerEmail,
    //         },
    //         data
    //     };

    //     try {
    //         await this.amqpConnection.publish(
    //             'notification_exchange',
    //             'event.event_cancelled',
    //             message
    //         );
    //         this.logger.log(`Notification sent to admin: ${eventManagerEmail}`);
    //     } catch (error) {
    //         this.logger.error(`Failed to publish notification to admin: ${eventManagerEmail}`, error);
    //     }
    // }
}