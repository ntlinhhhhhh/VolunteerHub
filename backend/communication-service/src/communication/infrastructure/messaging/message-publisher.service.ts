import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export interface NotificationMessage {
    type: string;
    userId: string;
    recipient: string;
    data: Record<string, any>;
}

@Injectable()
export class MessagePublisherService {
    constructor(private readonly amqpConnection: AmqpConnection) { }

    async publishPostCreated(postId: string, eventId: string, authorId: string, content: string): Promise<void> {
        const message: NotificationMessage = {
            type: 'new_post_on_event',
            userId: authorId,
            recipient: '', // Will be determined by notification service based on event participants
            data: {
                postId,
                eventId,
                content: content.substring(0, 100),
                createdAt: new Date(),
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'post.created', message);
    }

    async publishCommentAdded(postId: string, commentId: string, authorId: string, content: string): Promise<void> {
        const message: NotificationMessage = {
            type: 'new_comment_on_post',
            userId: authorId,
            recipient: '', // Will be determined by notification service based on post author
            data: {
                postId,
                commentId,
                content: content.substring(0, 100),
                createdAt: new Date(),
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'comment.added', message);
    }

    async publishLikeToggled(postId: string, userId: string, action: 'like' | 'unlike'): Promise<void> {
        const message: NotificationMessage = {
            type: action === 'like' ? 'post_liked' : 'post_unliked',
            userId,
            recipient: '', // Will be determined by notification service based on post author
            data: {
                postId,
                action,
                createdAt: new Date(),
            },
        };
        await this.amqpConnection.publish('notification_exchange', 'like.toggled', message);
    }
}