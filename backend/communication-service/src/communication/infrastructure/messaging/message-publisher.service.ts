import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';


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


export enum NotificationType {
    // Communication events
    NEW_POST_ON_EVENT = 'new_post_on_event',
    NEW_COMMENT_ON_POST = 'new_comment_on_post',
    LIKE = 'like',
    POST_LIKE = 'post_liked',
    POST_UNLIKE = 'post_unliked',

    // Admin alerts
    NEW_EVENT_PENDING = 'new_event_pending',
    NEW_VOLUNTEER_REGISTERED = 'new_volunteer_registered',
}

@Injectable()
export class MessagePublisherService {
    constructor(private readonly amqpConnection: AmqpConnection) { }

    async publishPostCreated(postId: string, eventId: string, authorId: string, authorName: string, content: string): Promise<void> {
        // Send to notification service
        const notificationMessage: NotificationMessage = {
            type: NotificationType.NEW_POST_ON_EVENT,
            userId: authorId,
            channels: {
                inApp: true,
            },
            data: {
                postId,
                eventId,
                content: content.substring(0, 100),
                createdAt: new Date(),
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'post.created', notificationMessage);

        // Send to dashboard service
        // chi An xử lý
        const dashboardMessage = {
            type: 'new_post_on_event',
            userId: authorId,
            eventId,
            data: {
                eventId,
                postId,
                authorId,
                authorName,
                postTitle: content.substring(0, 50),
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'post.created', dashboardMessage);
    }

    async publishCommentAdded(postId: string, commentId: string, authorId: string, authorName: string, eventId: string, content: string): Promise<void> {
        // Send to notification service
        const notificationMessage: NotificationMessage = {
            type: NotificationType.NEW_COMMENT_ON_POST,
            userId: authorId,
            channels: {
                inApp: true,
            },
            data: {
                postId,
                commentId,
                content: content.substring(0, 100),
                createdAt: new Date(),
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'comment.added', notificationMessage);

        // Send to dashboard service
        // cái này c An xử lý cùng dashboard-service nhé
        const dashboardMessage = {
            type: 'new_comment_on_post',
            userId: authorId,
            eventId,
            data: {
                eventId,
                postId,
                authorId,
                authorName,
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'comment.added', dashboardMessage);
    }

    async publishLikeToggled(postId: string, userId: string, action: 'like' | 'unlike'): Promise<void> {
        const message: NotificationMessage = {
            type: action === NotificationType.LIKE ? NotificationType.POST_LIKE : NotificationType.POST_UNLIKE,
            userId,
            channels: {
                inApp: true,
            },
            data: {
                postId,
                action,
                createdAt: new Date(),
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'like.toggled', message);
    }
}