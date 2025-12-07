import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { SendEmailNotificationUseCase } from '../../application/use-cases/send-email-notification.use-case';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NotificationChannel } from '../../domain/entities/notification-channel.enum';
import { NotificationMessage } from 'src/notification/application/dto/notificationMessage.dto';
import { CreateNotificationUseCase } from 'src/notification/application/use-cases/create-notification.use-case';

@Injectable()
export class NotificationConsumerService implements OnModuleInit {
    private readonly logger = new Logger(NotificationConsumerService.name);

    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly sendEmailUseCase: SendEmailNotificationUseCase,
        private readonly createNotificationUseCase: CreateNotificationUseCase
    ) {}

    async onModuleInit() {
        await this.rabbitMQService.consume(this.handleMessage.bind(this));
    }

    private async handleMessage(message: NotificationMessage): Promise<void> {
        this.logger.log(`Processing notification: ${message.type}`);

        try {
            if (!this.isValidNotificationType(message.type)) {
                this.logger.warn(`Unknown notification type: ${message.type}`);
                return;
            }

            const mappedType = this.mapMessageType(message.type);

            // create noti
            await this.createNotificationUseCase.execute({
                userId: message.userId,
                recipient: message.recipient,
                type: mappedType,
                channel: NotificationChannel.IN_APP,
                subject: `Thông báo: ${mappedType}`,
                content: `Bạn có thông báo mới: ${mappedType}`,
                data: message.data,
            });

            // send email
            await this.sendEmailUseCase.execute(message.userId, message.recipient, mappedType, message.data);
        } catch (error) {
            this.logger.error(`Failed to process message: ${message.type}`, error);
            throw error;
        }
    }

    private isValidNotificationType(type: string): boolean {
        return Object.values(NotificationType).includes(type as NotificationType);
    }

    private mapMessageType(type: string): NotificationType {
        const mapping: Record<string, NotificationType> = {
            'user_registered': NotificationType.USER_REGISTERED,
            'user_login': NotificationType.USER_LOGIN,
            'password_reset': NotificationType.PASSWORD_RESET,
            'user_locked': NotificationType.USER_LOCKED,
            'user_unlocked': NotificationType.USER_UNLOCKED,
            'event_created': NotificationType.EVENT_CREATED,
            'event_approved': NotificationType.EVENT_APPROVED,
            'event_rejected': NotificationType.EVENT_REJECTED,
            'event_cancelled': NotificationType.EVENT_CANCELLED,
            'registration_submitted': NotificationType.REGISTRATION_SUBMITTED,
            'registration_accepted': NotificationType.REGISTRATION_ACCEPTED,
            'registration_rejected': NotificationType.REGISTRATION_REJECTED,
            'registration_completed': NotificationType.REGISTRATION_COMPLETED,
            'new_post_on_event': NotificationType.NEW_POST_ON_EVENT,
            'new_comment_on_post': NotificationType.NEW_COMMENT_ON_POST,
            'new_event_pending': NotificationType.NEW_EVENT_PENDING,
            'new_volunteer_registered': NotificationType.NEW_VOLUNTEER_REGISTERED,
        };

        return mapping[type] || NotificationType.USER_REGISTERED;
    }
}
