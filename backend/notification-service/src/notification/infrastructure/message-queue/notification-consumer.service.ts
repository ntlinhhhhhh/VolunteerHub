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
    ) { }

    async onModuleInit() {
        // Bắt đầu lắng nghe message từ RabbitMQ
        await this.rabbitMQService.consume(this.handleMessage.bind(this));
    }

    private async handleMessage(message: NotificationMessage): Promise<void> {
        this.logger.log(`Processing notification: ${message.type}`);

        try {
            // Validate message type
            if (!this.isValidNotificationType(message.type)) {
                this.logger.warn(`Unknown notification type: ${message.type}`);
                return;
            }

            // Map message type thành NotificationType
            const mappedType = this.mapMessageType(message.type);

            // Tạo notification trong DB
            await this.createNotificationUseCase.execute({
                userId: message.userId,
                recipient: message.recipient,
                type: mappedType,
                channel: NotificationChannel.EMAIL, // Hoặc IN_APP nếu muốn
                subject: `Thông báo: ${mappedType}`,
                content: `Bạn có thông báo mới: ${mappedType}`,
                data: message.data,
            });

            // Gửi email notification
            await this.sendEmailUseCase.execute(
                message.userId,
                message.recipient,
                mappedType,
                message.data
            );
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
            'user.registered': NotificationType.USER_REGISTERED,
            'user.login': NotificationType.USER_LOGIN,
            'event.created': NotificationType.EVENT_CREATED,
            'event.approved': NotificationType.EVENT_APPROVED,
            'event.rejected': NotificationType.EVENT_REJECTED,
            'event.cancelled': NotificationType.EVENT_CANCELLED,
            'registration.submitted': NotificationType.REGISTRATION_SUBMITTED,
            'registration.accepted': NotificationType.REGISTRATION_ACCEPTED,
            'registration.rejected': NotificationType.REGISTRATION_REJECTED,
            'registration.completed': NotificationType.REGISTRATION_COMPLETED,
            'new.post': NotificationType.NEW_POST_ON_EVENT,
            'new.comment': NotificationType.NEW_COMMENT_ON_POST,
            'new.event.pending': NotificationType.NEW_EVENT_PENDING,
            'new.volunteer.registered': NotificationType.NEW_VOLUNTEER_REGISTERED,
        };

        return mapping[type] || NotificationType.USER_REGISTERED;
    }
}
