import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export enum NotificationType {
    USER_REGISTERED = 'user_registered',
    PASSWORD_RESET = 'password_reset',
    USER_LOCKED = 'user_locked',
    USER_UNLOCKED = 'user_unlocked',
}

export interface NotificationMessage {
    type: NotificationType;
    userId: string;
    channels: {
        inApp?: boolean;
        email?: string;
        push?: string;
    };
    data: Record<string, any>;
}


@Injectable()
export class MessagePublisherService {
    constructor(private readonly amqpConnection: AmqpConnection) { }

    async publishUserRegistered(authId: string, email: string, fullName: string): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.USER_REGISTERED,
            userId: authId,
            channels: {
                inApp: true,
                email: email,
            },
            data: {
                email: email,
                fullName: fullName,
                createdAt: new Date()
            }
        };
        await this.amqpConnection.publish('notification_exchange', 'auth.user_registered', message);
    }

    async publishResetPassword(authId: string, email: string, token: string, fullName: string): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.PASSWORD_RESET,
            userId: authId,
            channels: {
                inApp: true,
                email: email,
            },
            data: {
                fullName: fullName,
                resetUrl: `http://localhost:5173/reset-password?token=${token}&email=${email}`,
                title: 'Reset Password',
                message: 'Click link để đổi mật khẩu của bạn.',
                createdAt: new Date()
            }
        };
        await this.amqpConnection.publish('notification_exchange', 'auth.password_reset', message);
    }

        async publishLockUser(authId: string, email: string, fullName: string, reason: string): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.USER_LOCKED,
            userId: authId,
            channels: {
                inApp: true,
                email: email,
            },
            data: {
                fullName: fullName,
                reason: reason,
                supportUrl: `http://localhost:5173/support`,
                title: 'Reset Password',
                message: `Tài khoản của bạn đã bị khóa vì ${reason}.`,
                createdAt: new Date()
            }
        };
        await this.amqpConnection.publish('notification_exchange', 'auth.user_locked', message);
    }

        async publishUnlockUser(authId: string, email: string, fullName: string): Promise<void> {
        const message: NotificationMessage = {
            type: NotificationType.USER_UNLOCKED,
            userId: authId,
            channels: {
                inApp: true,
                email: email,
            },
            data: {
                fullName: fullName,
                title: 'Reset Password',
                message: 'Tài khoản của bạn đã được mở khỏa.',
                createdAt: new Date()
            }
        };
        await this.amqpConnection.publish('notification_exchange', 'auth.user_unlocked', message);
    }
}