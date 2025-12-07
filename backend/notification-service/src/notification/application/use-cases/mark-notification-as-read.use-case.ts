import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.markAsRead(notificationId);
  }
}
