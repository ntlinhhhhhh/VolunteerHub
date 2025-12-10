import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { GetUserNotificationsUseCase } from '../../application/use-cases/get-user-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.use-case';
import { SendEmailNotificationUseCase } from '../../application/use-cases/send-email-notification.use-case';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';
import { SendNotificationDto } from '../../application/dto/send-notification.dto';
import { NotificationType } from '../../domain/entities/notification-type.enum';

@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
        private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
        private readonly sendEmailUseCase: SendEmailNotificationUseCase,
        private readonly createNotificationUseCase: CreateNotificationUseCase
    ) {}

    /**
     * GET /notifications/:userId?limit=20
     * Lấy danh sách notifications của user
     */
    @Get(':userId')
    async getUserNotifications(
        @Param('userId') userId: string,
        @Query('limit') limit?: number
    ) {
        const notifications = await this.getUserNotificationsUseCase.execute(
            userId,
            limit ? parseInt(limit.toString()) : 20
        );

        return { success: true, data: notifications };
    }

    /**
     * PATCH /notifications/:id/read
     * Đánh dấu notification đã đọc
     */
    @Patch(':id/read')
    async markNotificationAsRead(@Param('id') id: string) {
        await this.markAsReadUseCase.execute(id);
        return { success: true, message: 'Notification marked as read' };
    }

    /**
     * POST /notifications/send
     * Gửi notification thủ công (cả email + lưu DB)
     * Hỗ trợ multi-channel (inApp/email/push)
     */
    // @Post('send')
    // async sendNotification(@Body() dto: SendNotificationDto) {
    //     // 1️⃣ Tạo notification trong DB
    //     await this.createNotificationUseCase.execute({
    //         userId: dto.userId,
    //         type: dto.type as NotificationType,
    //         channels: dto.channels || {}, // mới: support multi-channel
    //         subject: dto.subject,
    //         content: dto.content,
    //         data: dto.data || {},
    //     });

    //     // 2️⃣ Nếu có email, gửi luôn
    //     if (dto.channels?.email) {
    //         await this.sendEmailUseCase.execute(
    //             dto.userId,
    //             dto.channels.email,
    //             dto.type as NotificationType,
    //             dto.data || {}
    //         );
    //     }

    //     return { success: true, message: 'Notification sent successfully' };
    // }

    /**
     * POST /notifications/test-email
     * Test gửi email trực tiếp mà không lưu DB
     */
    @Post('test-email')
    async testSendEmail(@Body() dto: { recipient: string; subject: string; content: string }) {
        await this.sendEmailUseCase.execute(
            'test-user-id',
            dto.recipient,
            NotificationType.USER_REGISTERED,
            { message: dto.content }
        );

        return { success: true, message: 'Test email sent' };
    }
}
