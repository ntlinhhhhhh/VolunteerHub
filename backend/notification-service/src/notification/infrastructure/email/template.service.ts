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
        this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
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
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 8px; }
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

            [NotificationType.PASSWORD_RESET]: {
                subject: '🔐 Yêu cầu đặt lại mật khẩu của bạn',
                html: `
                    <html>
                    <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; background: #e6f0ff; color: #1a202c; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; padding: 0; }
                        .header { background: #7fb3ff; padding: 25px; color: white; border-radius: 12px 12px 0 0; text-align: center; }
                        .content { background: #f0f7ff; padding: 25px; border-radius: 0 0 12px 12px; }
                        .otp-box { font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #3399ff; background: #d9eaff; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #b3d1ff; }
                        .button { display: inline-block; margin-top: 20px; padding: 14px 30px; background: #3399ff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; transition: background 0.3s; }
                        .button:hover { background: #2673cc; }
                        .note { color: #5a738e; font-size: 14px; margin-top: 20px; }
                    </style>
                    </head>
                    
                    <body>
                    <div class="container">
                        <div class="header">
                        <h2>🔐 Đặt lại mật khẩu</h2>
                        </div>

                        <div class="content">
                        <p>Xin chào <strong>{{fullName}}</strong>,</p>

                        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu tài khoản của bạn.</p>

                        <center>
                            <a href="{{resetUrl}}" class="button">
                            Đặt lại mật khẩu ngay
                            </a>
                        </center>

                        <p class="note">
                            Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.  
                            Tài khoản của bạn vẫn an toàn.
                        </p>
                        </div>
                    </div>
                    </body>
                    </html>
                `,
            },

            [NotificationType.USER_LOCKED]: {
                subject: '🔐 Tài khoản của bạn đã bị khóa',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Tài khoản bị khóa</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{fullName}}</strong>,</p>
                            <p>Tài khoản của bạn đã <strong>bị khóa</strong>.</p>
                            <p><strong>Lý do:</strong> {{reason}}</p>
                            <p>Vui lòng liên hệ bộ phận hỗ trợ nếu bạn cho rằng đây là nhầm lẫn.</p>
                            <center>
                                <a href="{{supportUrl}}" class="button">Liên hệ hỗ trợ</a>
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

            [NotificationType.USER_UNLOCKED]: {
                subject: '🔓 Tài khoản của bạn đã được mở khóa',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔓 Tài khoản đã mở khóa</h1>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{fullName}}</strong>,</p>
                            <p>Tài khoản của bạn đã <strong>được mở khóa</strong> và bạn có thể đăng nhập ngay bây giờ.</p>
                            <p>Cảm ơn bạn đã sử dụng VolunteerHub!</p>
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



            [NotificationType.EVENT_CREATED]: {
                subject: '🎉 Sự kiện mới "{{eventName}}" đã được tạo!',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .event-box { padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px; background: #ffffff; }
                    .button { display: inline-block; padding: 12px 28px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎉 Sự kiện mới đã được tạo</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{managerName}}</strong>,</p>
                            <p>Sự kiện của bạn đã được tạo thành công và đang chờ Admin phê duyệt.</p>

                            <div class="event-box">
                                <h3>{{eventName}}</h3>
                                <p>📅 <strong>Thời gian:</strong> {{eventDate}}</p>
                                <p>📍 <strong>Địa điểm:</strong> {{eventLocation}}</p>
                                <p>👥 <strong>Số lượng yêu cầu:</strong> {{maxVolunteers}}</p>
                            </div>

                            <center>
                                <a href="{{frontendUrl}}/manage/events/{{eventId}}" class="button">Xem chi tiết</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            [NotificationType.EVENT_APPROVED]: {
                subject: '✅ Sự kiện "{{eventName}}" đã được phê duyệt!',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .event-box { padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px; background: #ffffff; }
                    .button { display: inline-block; padding: 12px 28px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>✅ Sự kiện đã được phê duyệt!</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{managerName}}</strong>,</p>
                            <p>Chúc mừng! Sự kiện của bạn đã được Admin phê duyệt và công khai.</p>
                            <div class="event-box">
                                <h3>{{eventName}}</h3>
                                <p>📅 <strong>Thời gian:</strong> {{eventDate}}</p>
                                <p>📍 <strong>Địa điểm:</strong> {{eventLocation}}</p>
                                <p>👥 <strong>Số lượng:</strong> {{maxVolunteers}} tình nguyện viên</p>
                            </div>
                            <center>
                                <a href="{{frontendUrl}}/events/{{eventId}}" class="button">Xem sự kiện</a>
                            </center>
                        </div>
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
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .event-box { padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px; background: #ffffff; }
                    .button { display: inline-block; padding: 12px 28px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>❌ Sự kiện không được phê duyệt</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{managerName}}</strong>,</p>
                            <p>Rất tiếc, sự kiện <strong>"{{eventName}}"</strong> của bạn chưa được phê duyệt.</p>
                            <div class="event-box">
                                <p><strong>Lý do:</strong> {{rejectionReason}}</p>
                            </div>
                            <p>Vui lòng chỉnh sửa và gửi lại.</p>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            [NotificationType.EVENT_CANCELLED]: {
                subject: '⚠️ Sự kiện "{{eventName}}" đã bị hủy',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .event-box { padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px; background: #ffffff; }
                    .button { display: inline-block; padding: 12px 28px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>⚠️ Sự kiện đã bị hủy</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{receiverName}}</strong>,</p>
                            <p>Sự kiện <strong>{{eventName}}</strong> đã bị hủy bởi quản lý.</p>
                            <div class="event-box">
                                <p><strong>Lý do:</strong> {{cancelReason}}</p>
                            </div>
                            <center>
                                <a href="{{frontendUrl}}/events" class="button">Xem sự kiện khác</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

           [NotificationType.REGISTRATION_ACCEPTED]: {
                subject: '✅ Đăng ký tham gia "{{eventName}}" được chấp nhận!',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .event-box { padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px; background: #ffffff; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    ul { padding-left: 20px; }
                    li { margin-bottom: 8px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎉 Chúc mừng!</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{volunteerName}}</strong>,</p>
                            <p>Đăng ký tham gia sự kiện của bạn đã được quản lý chấp nhận!</p>
                            <div class="event-box">
                                <h3>{{eventName}}</h3>
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
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .volunteer-box { background: #ffffff; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>📋 Đăng ký mới cần duyệt</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{managerName}}</strong>,</p>
                            <p>Có tình nguyện viên mới đăng ký tham gia sự kiện <strong>"{{eventName}}"</strong> của bạn.</p>
                            <div class="volunteer-box">
                                <h3>Thông tin tình nguyện viên:</h3>
                                <p><strong>Họ tên:</strong> {{volunteerName}}</p>
                                <p><strong>Email:</strong> {{volunteerEmail}}</p>
                                <p><strong>Số điện thoại:</strong> {{volunteerPhone}}</p>
                                <p><strong>Thời gian đăng ký:</strong> {{registrationTime}}</p>
                            </div>
                            <center>
                                <a href="{{frontendUrl}}/manage/events/{{eventId}}/registrations" class="button">Xem & Duyệt</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            [NotificationType.REGISTRATION_REJECTED]: {
                subject: '❌ Đăng ký tham gia sự kiện "{{eventName}}" đã bị từ chối',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .event-box { padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>❌ Đăng ký bị từ chối</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{volunteerName}}</strong>,</p>
                            <p>Rất tiếc, đăng ký tham gia sự kiện <strong>{{eventName}}</strong> của bạn đã bị từ chối.</p>
                            <div class="event-box">
                                <p><strong>Lý do:</strong> {{reason}}</p>
                            </div>
                            <p>Bạn có thể tìm các sự kiện phù hợp khác.</p>
                            <center>
                                <a href="{{frontendUrl}}/events" class="button">Xem sự kiện khác</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            [NotificationType.REGISTRATION_COMPLETED]: {
                subject: '🎉 Bạn đã hoàn thành hoạt động "{{eventName}}"!',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .event-box { padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎉 Hoàn thành hoạt động!</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>{{volunteerName}}</strong>,</p>
                            <p>Bạn vừa hoàn thành sự kiện <strong>{{eventName}}</strong> vào <strong>{{completeDate}}</strong>.</p>
                            <p>Cảm ơn bạn đã đóng góp vì cộng đồng ❤️</p>
                            <p>Điểm tích lũy của bạn: <strong>{{rewardPoints}}</strong></p>
                            <center>
                                <a href="{{frontendUrl}}/profile" class="button">Xem hồ sơ</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            [NotificationType.NEW_POST_ON_EVENT]: {
                subject: '📝 Bài đăng mới trong sự kiện "{{eventName}}"',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .post-box { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>📝 Bài đăng mới</h2>
                        </div>
                        <div class="content">
                            <p>Trong sự kiện <strong>{{eventName}}</strong> vừa có bài đăng mới:</p>
                            <div class="post-box">
                                <h3>{{postTitle}}</h3>
                                <p>{{postContent}}</p>
                            </div>
                            <center>
                                <a href="{{frontendUrl}}/events/{{eventId}}/posts" class="button">Xem bài đăng</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            [NotificationType.NEW_COMMENT_ON_POST]: {
                subject: '💬 Bình luận mới về bài viết "{{postTitle}}"',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 30px; border-radius: 0 0 10px 10px; }
                    .comment-box { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>💬 Có bình luận mới</h2>
                        </div>
                        <div class="content">
                            <p>Bài viết <strong>{{postTitle}}</strong> vừa có bình luận mới từ <strong>{{commenterName}}</strong>:</p>
                            <div class="comment-box">
                                <p>"{{commentContent}}"</p>
                            </div>
                            <center>
                                <a href="{{frontendUrl}}/events/{{eventId}}/posts/{{postId}}" class="button">Xem bài viết</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            // ==========================================
            // ADMIN / EVENT-MANAGER ALERTS
            // ==========================================
            [NotificationType.NEW_VOLUNTEER_REGISTERED]: {
                subject: '🙋‍♂️ Tình nguyện viên mới vừa đăng ký hệ thống',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 25px; border-radius: 0 0 10px 10px; }
                    .info-box { background: #ffffff; border-left: 6px solid #5b9df9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🙋‍♂️ Tình nguyện viên mới</h2>
                        </div>
                        <div class="content">
                            <p>Hệ thống vừa ghi nhận một tình nguyện viên mới đăng ký:</p>
                            <div class="info-box">
                                <p><strong>Họ tên:</strong> {{fullName}}</p>
                                <p><strong>Email:</strong> {{email}}</p>
                                <p><strong>Thời gian:</strong> {{registeredAt}}</p>
                            </div>
                            <center>
                                <a href="{{frontendUrl}}/admin/volunteers" class="button">Xem danh sách</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
                `,
            },

            [NotificationType.NEW_EVENT_PENDING]: {
                subject: '🔔 Sự kiện mới cần phê duyệt',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #e8f0ff; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #a8d0ff; color: #1e3a8a; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f0f7ff; padding: 25px; border-radius: 0 0 10px 10px; }
                    .alert-box { background: #ffffff; border-left: 6px solid #5b9df9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background: #5b9df9; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🔔 Sự kiện mới cần phê duyệt</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào Admin / Event Manager,</p>
                            <p>Có sự kiện mới cần phê duyệt:</p>
                            <div class="alert-box">
                                <p><strong>Tên sự kiện:</strong> {{eventName}}</p>
                                <p><strong>Người tạo:</strong> {{managerName}}</p>
                                <p><strong>Thời gian:</strong> {{eventDate}}</p>
                            </div>
                            <center>
                                <a href="{{frontendUrl}}/admin/events/pending" class="button">Xem & Duyệt</a>
                            </center>
                        </div>
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
