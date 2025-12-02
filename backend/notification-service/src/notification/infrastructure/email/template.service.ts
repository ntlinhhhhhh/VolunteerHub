/**
 * GIẢI THÍCH:
 * Service render HTML email templates.
 * Dùng Handlebars để compile templates với data dynamic.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';
import { NotificationType } from '../../domain/entities/notification-type.enum';

interface EmailTemplate {
  subject: string;
  html: string;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers() {
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });
  }

  /**
   * Render template theo type
   */
  render(type: NotificationType, data: Record<string, any>): EmailTemplate {
    const template = this.getTemplate(type);
    
    // Compile với Handlebars
    const subjectTemplate = Handlebars.compile(template.subject);
    const htmlTemplate = Handlebars.compile(template.html);

    // Add common data
    const templateData = {
      ...data,
      frontendUrl: this.frontendUrl,
      year: new Date().getFullYear(),
    };

    return {
      subject: subjectTemplate(templateData),
      html: htmlTemplate(templateData),
    };
  }

  /**
   * Get template theo type
   */
  private getTemplate(type: NotificationType): { subject: string; html: string } {
    const templates = {
      // ==========================================
      // AUTH TEMPLATES
      // ==========================================
      [NotificationType.USER_REGISTERED]: {
        subject: 'Chào mừng đến với VolunteerHub! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Chào mừng bạn đến với VolunteerHub!</h1>
              </div>
              <div class="content">
                <p>Xin chào <strong>{{fullName}}</strong>,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại VolunteerHub. Chúng tôi rất vui mừng được chào đón bạn!</p>
                <p><strong>Email của bạn:</strong> {{email}}</p>
                <p>Bây giờ bạn có thể:</p>
                <ul>
                  <li>Tham gia các hoạt động tình nguyện</li>
                  <li>Kết nối với cộng đồng tình nguyện viên</li>
                  <li>Theo dõi lịch sử hoạt động của bạn</li>
                </ul>
                <center>
                  <a href="{{frontendUrl}}/login" class="button">Đăng nhập ngay</a>
                </center>
              </div>
              <div class="footer">
                <p>&copy; {{year}} VolunteerHub. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      },

      [NotificationType.USER_LOGIN]: {
        subject: 'Đăng nhập thành công vào VolunteerHub',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .alert { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>🔐 Thông báo đăng nhập</h2>
              <div class="alert">
                <p><strong>Thời gian:</strong> {{loginTime}}</p>
                <p><strong>Địa chỉ IP:</strong> {{ipAddress}}</p>
                <p><strong>Thiết bị:</strong> {{device}}</p>
              </div>
              <p>Nếu bạn không thực hiện đăng nhập này, vui lòng đổi mật khẩu ngay lập tức.</p>
            </div>
          </body>
          </html>
        `,
      },

      // ==========================================
      // EVENT TEMPLATES
      // ==========================================
      [NotificationType.EVENT_APPROVED]: {
        subject: '✅ Sự kiện "{{eventName}}" đã được phê duyệt!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .success { background: #d4edda; padding: 20px; border-left: 4px solid #28a745; border-radius: 5px; }
              .event-info { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success">
                <h2>✅ Sự kiện đã được phê duyệt!</h2>
              </div>
              <p>Xin chào <strong>{{managerName}}</strong>,</p>
              <p>Chúc mừng! Sự kiện của bạn đã được Admin phê duyệt.</p>
              <div class="event-info">
                <h3>{{eventName}}</h3>
                <p><strong>📅 Thời gian:</strong> {{eventDate}}</p>
                <p><strong>📍 Địa điểm:</strong> {{eventLocation}}</p>
                <p><strong>👥 Số lượng:</strong> {{maxVolunteers}} tình nguyện viên</p>
              </div>
              <p>Sự kiện của bạn đã được công khai và tình nguyện viên có thể đăng ký tham gia.</p>
              <center>
                <a href="{{frontendUrl}}/events/{{eventId}}" class="button">Xem sự kiện</a>
              </center>
            </div>
          </body>
          </html>
        `,
      },

      [NotificationType.EVENT_REJECTED]: {
        subject: '❌ Sự kiện "{{eventName}}" không được phê duyệt',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .error { background: #f8d7da; padding: 20px; border-left: 4px solid #dc3545; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">
                <h2>❌ Sự kiện không được phê duyệt</h2>
              </div>
              <p>Xin chào <strong>{{managerName}}</strong>,</p>
              <p>Rất tiếc, sự kiện <strong>"{{eventName}}"</strong> của bạn chưa được phê duyệt.</p>
              <p><strong>Lý do:</strong> {{rejectionReason}}</p>
              <p>Vui lòng chỉnh sửa và gửi lại.</p>
            </div>
          </body>
          </html>
        `,
      },

      // ==========================================
      // REGISTRATION TEMPLATES
      // ==========================================
      [NotificationType.REGISTRATION_ACCEPTED]: {
        subject: '✅ Đăng ký tham gia "{{eventName}}" được chấp nhận!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .success { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; }
              .event-card { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success">
                <h1>🎉 Chúc mừng!</h1>
                <p>Đăng ký của bạn đã được chấp nhận</p>
              </div>
              <p>Xin chào <strong>{{volunteerName}}</strong>,</p>
              <p>Đăng ký tham gia sự kiện của bạn đã được quản lý chấp nhận!</p>
              <div class="event-card">
                <h2>{{eventName}}</h2>
                <p>📅 <strong>Thời gian:</strong> {{eventDate}}</p>
                <p>📍 <strong>Địa điểm:</strong> {{eventLocation}}</p>
                <p>👤 <strong>Quản lý:</strong> {{managerName}}</p>
                <p>📝 <strong>Ghi chú:</strong> {{notes}}</p>
              </div>
              <p><strong>Lưu ý quan trọng:</strong></p>
              <ul>
                <li>Vui lòng có mặt đúng giờ</li>
                <li>Mang theo giấy tờ tùy thân</li>
                <li>Liên hệ quản lý nếu có thay đổi</li>
              </ul>
              <center>
                <a href="{{frontendUrl}}/events/{{eventId}}" class="button">Xem chi tiết</a>
              </center>
            </div>
          </body>
          </html>
        `,
      },

      [NotificationType.REGISTRATION_SUBMITTED]: {
        subject: 'Có tình nguyện viên mới đăng ký sự kiện "{{eventName}}"',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .alert { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 5px; }
              .volunteer-info { background: white; padding: 15px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
              .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="alert">
                <h2>📋 Đăng ký mới cần duyệt</h2>
              </div>
              <p>Xin chào <strong>{{managerName}}</strong>,</p>
              <p>Có tình nguyện viên mới đăng ký tham gia sự kiện <strong>"{{eventName}}"</strong> của bạn.</p>
              <div class="volunteer-info">
                <h3>Thông tin tình nguyện viên:</h3>
                <p><strong>Họ tên:</strong> {{volunteerName}}</p>
                <p><strong>Email:</strong> {{volunteerEmail}}</p>
                <p><strong>Số điện thoại:</strong> {{volunteerPhone}}</p>
                <p><strong>Thời gian đăng ký:</strong> {{registrationTime}}</p>
              </div>
              <p>Vui lòng xem xét và phê duyệt đăng ký này.</p>
              <center>
                <a href="{{frontendUrl}}/manage/events/{{eventId}}/registrations" class="button">Xem & Duyệt</a>
              </center>
            </div>
          </body>
          </html>
        `,
      },

      // ==========================================
      // ADMIN ALERTS
      // ==========================================
      [NotificationType.NEW_EVENT_PENDING]: {
        subject: '🔔 Sự kiện mới cần phê duyệt',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .admin-alert { background: #e7f3ff; padding: 20px; border-left: 4px solid #2196F3; border-radius: 5px; }
              .button { display: inline-block; padding: 12px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="admin-alert">
                <h2>🔔 Admin Alert: Sự kiện mới</h2>
              </div>
              <p>Xin chào Admin,</p>
              <p>Có sự kiện mới cần phê duyệt:</p>
              <p><strong>Tên sự kiện:</strong> {{eventName}}</p>
              <p><strong>Người tạo:</strong> {{managerName}}</p>
              <p><strong>Thời gian:</strong> {{eventDate}}</p>
              <center>
                <a href="{{frontendUrl}}/admin/events/pending" class="button">Xem & Duyệt</a>
              </center>
            </div>
          </body>
          </html>
        `,
      },
    };

    return templates[type] || {
      subject: 'Thông báo từ VolunteerHub',
      html: '<p>{{message}}</p>',
    };
  }
}
