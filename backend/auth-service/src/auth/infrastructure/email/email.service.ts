import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendResetPassword(email: string, token: string) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
      await this.transporter.sendMail({
        from: `"Volunteer Hub" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Token expires in 1 hour.</p>`,
      });
    } catch (err) {
      console.error('EmailService.sendResetPassword error:', err);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
