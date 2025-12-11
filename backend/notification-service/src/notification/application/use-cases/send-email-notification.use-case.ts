import { Injectable, Inject, Logger } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NotificationChannel } from '../../domain/entities/notification-channel.enum';
import { NotificationStatus } from '../../domain/entities/notification-status.enum';
import { EmailService } from '../../infrastructure/email/email.service';
import { TemplateService } from '../../infrastructure/email/template.service';

@Injectable()
export class SendEmailNotificationUseCase {
    private readonly logger = new Logger(SendEmailNotificationUseCase.name);

    constructor(
        @Inject(INotificationRepository)
        private readonly notificationRepository: INotificationRepository,
        private readonly emailService: EmailService,
        private readonly templateService: TemplateService,
    ) { }

    async execute(
        userId: string,
        recipient: string,
        type: NotificationType,
        data: Record<string, any>
    ): Promise<void> {
        this.logger.log(`Sending ${type} notification to ${recipient}`);
        let notification;
        try {
            // 1. Get email template
            const { subject, html } = this.templateService.render(type, data);

            // 2. Create notification record (PENDING)
            notification = await this.notificationRepository.create({
                userId,
                type,
                channel: NotificationChannel.EMAIL,
                status: NotificationStatus.PENDING,
                recipient,
                subject,
                content: html,
                data,
                sentAt: null,
                readAt: null,
                errorMessage: null,
                retryCount: 0,
            } as any);

            // 3. Send email
            await this.emailService.sendEmail({
                to: recipient,
                subject,
                html,
            });

            // 4. Update status to SENT
            await this.notificationRepository.updateStatus(
                notification.id,
                NotificationStatus.SENT
            );

            this.logger.log(`✅ Email sent successfully to ${recipient}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send email to ${recipient}:`, error.message);
            await this.notificationRepository.updateStatus(
                notification.id,
                NotificationStatus.FAILED,
                error
            );
        }
    }
}