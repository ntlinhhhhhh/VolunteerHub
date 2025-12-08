import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateNotificationUseCase } from 'src/notification/application/use-cases/create-notification.use-case';
import { SendEmailNotificationUseCase } from 'src/notification/application/use-cases/send-email-notification.use-case';
import { INotificationRepository } from 'src/notification/domain/repositories/notification.repository.interface';
import { NotificationConsumerService } from 'src/notification/infrastructure/message-bus/notification-consumer.service';
import { RabbitMQService } from 'src/notification/infrastructure/message-bus/rabbitmq.service';
import { NotificationRepository } from 'src/notification/infrastructure/repositories/notification.repository';
import { EmailService } from './notification/infrastructure/email/email.service';
import { TemplateService } from './notification/infrastructure/email/template.service';
import { Notification, NotificationSchema } from './notification/infrastructure/database/schemas/notification.schema';
import { NotificationController } from './notification/presentation/controllers/notification.controller';
import { MarkNotificationAsReadUseCase } from './notification/application/use-cases/mark-notification-as-read.use-case';
import { GetUserNotificationsUseCase } from './notification/application/use-cases/get-user-notifications.use-case';


@Module({
    imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/notification-service'),
    MongooseModule.forFeature([
        { name: Notification.name, schema: NotificationSchema },
    ]),

    ],
    controllers: [NotificationController],
    providers: [
        CreateNotificationUseCase,
        SendEmailNotificationUseCase,
        NotificationConsumerService,
        RabbitMQService,
        EmailService,
        TemplateService,
        NotificationRepository,
        MarkNotificationAsReadUseCase,
        GetUserNotificationsUseCase,
        { provide: INotificationRepository, useClass: NotificationRepository },
    ],
    exports: [EmailService, NotificationRepository],
})
export class AppModule { }
