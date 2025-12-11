/**
 * GIẢI THÍCH:
 * Use Case để user xem lại các thông báo đã nhận.
 */
import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationChannel } from 'src/notification/domain/entities/notification-channel.enum';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(userId: string, limit: number = 20, channel?: NotificationChannel): Promise<Notification[]> {
    return await this.notificationRepository.findByUserId(userId, limit, channel);
  }
}