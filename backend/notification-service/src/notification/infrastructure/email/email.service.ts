import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: Transporter;

    constructor(private configService: ConfigService) {
        this.createTransporter();
    }


    private createTransporter() {
        const host = this.configService.get('SMTP_HOST');
        const port = this.configService.get('SMTP_PORT');
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');

        this.logger.log(`📧 Initializing SMTP: ${user}@${host}:${port}`);

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });

        // Verify connection
        this.transporter.verify((error, success) => {
            if (error) {
                this.logger.error('❌ SMTP connection failed:', error);
            } else {
                this.logger.log('✅ SMTP server ready to send emails');
            }
        });
    }

    /**
     * Gửi email
     */
    async sendEmail(options: SendEmailOptions): Promise<void> {
        const { to, subject, html, attachments } = options;

        try {
            const info = await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM'),
                to,
                subject,
                html,
                attachments,
            });

            this.logger.log(`✅ Email sent to ${to}: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send email to ${to}:`, error);
            throw error;
        }
    }

    /**
     * Gửi nhiều emails cùng lúc
     */
    async sendBulkEmails(emails: SendEmailOptions[]): Promise<void> {
        const results = await Promise.allSettled(
            emails.map(email => this.sendEmail(email))
        );

        const failed = results.filter(r => r.status === 'rejected').length;
        const success = results.length - failed;

        this.logger.log(`Bulk email result: ${success} success, ${failed} failed`);
    }
}