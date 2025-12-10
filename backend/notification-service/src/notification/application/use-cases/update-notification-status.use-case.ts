import { Injectable } from "@nestjs/common";
import { NotificationStatus } from "src/notification/domain/entities/notification-status.enum";
import { NotificationRepository } from "src/notification/infrastructure/repositories/notification.repository";

@Injectable()
export class UpdateNotificationStatusUseCase {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    async markSent(id: string) {
        return await this.notificationRepository.updateStatus(id, NotificationStatus.SENT);
    }

    async markFailed(id: string, error: string) {
        return await this.notificationRepository.updateStatus(id,NotificationStatus.FAILED, error);
    }
}
