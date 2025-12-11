import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationStatus } from '../../domain/entities/notification-status.enum';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class CreateNotificationUseCase {
    constructor(
        @Inject(INotificationRepository)
        private readonly notificationRepository: INotificationRepository,
    ) { }

    async execute(dto: CreateNotificationDto): Promise<Notification> {

        console.log('called CreateNotificationUseCase')
        const now = new Date();

        const notificationData = new Notification(
            '',
            dto.userId,
            dto.type,
            dto.channel,
            dto.channels || {},
            NotificationStatus.PENDING,
            dto.subject,
            dto.content,
            dto.data || {},
            null,
            null,
            null,
            0,
            now,
            now
        );

        return this.notificationRepository.create(notificationData);
    }
}
