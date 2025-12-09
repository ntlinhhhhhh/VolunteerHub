import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { SendEmailNotificationUseCase } from '../../application/use-cases/send-email-notification.use-case';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';
import { NotificationChannel } from '../../domain/entities/notification-channel.enum';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NotificationMessage } from 'src/notification/application/dto/notificationMessage.dto';

@Injectable()
export class NotificationConsumerService implements OnModuleInit {
    private readonly logger = new Logger(NotificationConsumerService.name);

    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly sendEmailUseCase: SendEmailNotificationUseCase,
        private readonly createNotificationUseCase: CreateNotificationUseCase,
    ) { }

    async onModuleInit() {
        await this.rabbitMQService.consume(this.handleMessage.bind(this));
    }

    private async handleMessage(message: NotificationMessage): Promise<void> {
        const { userId, channels, type, data } = message;
        this.logger.log(`Processing notification: ${type}`);

        const mappedType = type as NotificationType;

        try {
            // In-App notification
            if (channels?.inApp) {
                await this.createNotificationUseCase.execute({
                    userId,
                    type: mappedType,
                    channel: NotificationChannel.IN_APP,
                    channels,
                    subject: `Thông báo: ${mappedType}`,
                    content: `Bạn có thông báo mới: ${mappedType}`,
                    data,
                });
            }

            // Email notification
            if (channels?.email) {
                await this.createNotificationUseCase.execute({
                    userId,
                    type: mappedType,
                    channel: NotificationChannel.EMAIL,
                    channels,
                    subject: `Thông báo: ${mappedType}`,
                    content: `Bạn có thông báo mới: ${mappedType}`,
                    data,
                });

                await this.sendEmailUseCase.execute(userId, channels.email, mappedType, data);
            }

            // 
            if (channels?.push) {
                // await this.sendPushUseCase.execute(userId, channels.push, mappedType, data);
            }
        } catch (error) {
            this.logger.error(`Failed to process message: ${type}`, error);
            throw error;
        }
    }
}
