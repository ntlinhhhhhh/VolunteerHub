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
        const host = this.configService.get<string>('SMTP_HOST');
        const port = Number(this.configService.get<string>('SMTP_PORT'));
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');

        this.logger.log(`📧 Initializing SMTP: ${user}@${host}:${port}`);

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // 🔑 QUAN TRỌNG
            auth: {
                user,
                pass,
            },
            connectionTimeout: 20000,
            socketTimeout: 20000,
        });

        // ✅ verify ĐÚNG transporter
        this.transporter.verify((error, success) => {
            if (error) {
                this.logger.error('❌ SMTP connection failed', error);
            } else {
                this.logger.log('✅ SMTP server ready to send emails');
            }
        });
    }

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

            this.logger.log(`📨 Sent to ${to}: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
            throw error;
        }
    }

    async sendBulkEmails(emails: SendEmailOptions[]): Promise<void> {
        const results = await Promise.allSettled(
            emails.map(email => this.sendEmail(email)),
        );

        const failed = results.filter(r => r.status === 'rejected').length;
        const success = results.length - failed;

        this.logger.log(`📦 Bulk email: ${success} success, ${failed} failed`);
    }
}
