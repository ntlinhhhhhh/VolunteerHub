/**
 * GIẢI THÍCH:
 * Use Case để user xem lại các thông báo đã nhận.
 */
import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(userId: string, limit: number = 20): Promise<Notification[]> {
    return await this.notificationRepository.findByUserId(userId, limit);
  }
}