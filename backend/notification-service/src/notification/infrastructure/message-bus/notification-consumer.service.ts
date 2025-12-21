import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { SendEmailNotificationUseCase } from '../../application/use-cases/send-email-notification.use-case';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';
import { NotificationChannel } from '../../domain/entities/notification-channel.enum';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NotificationMessage } from 'src/notification/application/dto/notificationMessage.dto';
import { UpdateNotificationStatusUseCase } from 'src/notification/application/use-cases/update-notification-status.use-case';

@Injectable()
export class NotificationConsumerService implements OnModuleInit {
    private readonly logger = new Logger(NotificationConsumerService.name);

    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly sendEmailUseCase: SendEmailNotificationUseCase,
        private readonly createNotificationUseCase: CreateNotificationUseCase,
        private readonly updateNotificationStatusUseCase: UpdateNotificationStatusUseCase,
    ) { }

    async onModuleInit() {
        await this.rabbitMQService.consume(this.handleMessage.bind(this));
    }

    private async handleMessage(message: NotificationMessage): Promise<void> {
        const { userId, channels, type, data } = message;
        this.logger.log(`Processing notification: ${type}`);

        const mappedType = type as NotificationType;

        // ===============================
        // 1. IN-APP NOTIFICATION
        // ===============================
        if (channels?.inApp) {
            let notificationInApp;
            try {
                notificationInApp = await this.createNotificationUseCase.execute({
                    userId,
                    type: mappedType,
                    channel: NotificationChannel.IN_APP,
                    channels,
                    subject: `Thông báo: ${mappedType}`,
                    content: `Bạn có thông báo mới: ${mappedType}`,
                    data,
                });

                await this.updateNotificationStatusUseCase.markSent(notificationInApp.id);
            } catch (err) {
                this.logger.error(`In-App notification failed: ${err.message}`);

                if (notificationInApp?.id) {
                    await this.updateNotificationStatusUseCase.markFailed(
                        notificationInApp.id,
                        err.message
                    );
                }
            }
        }

        // 2. EMAIL NOTIFICATION
        if (channels?.email) {
            await this.sendEmailUseCase.execute(userId, channels.email, mappedType, data);
        }
    }
}
