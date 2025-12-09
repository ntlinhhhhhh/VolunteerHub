import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
@Injectable()
export class ForgotPasswordUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        private readonly rabbitmq: AmqpConnection,

    ) { console.log('✅ ForgotPasswordUseCase constructor called'); }

    async execute(email: string) {
        const auth = await this.authRepository.findByEmail(email);
        if (!auth) throw new NotFoundException('Email not found');

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600_000);

        auth.resetPasswordToken = token;
        auth.resetPasswordExpires = expires;

        await this.authRepository.updateAuth(auth.id, auth);

        this.rabbitmq.publish(
            'notification_exchange',
            'user.reset_password',
            {
                type: 'password_reset',
                userId: auth.id,
                recipient: email,
                data: {
                    username: 'tlinh',
                    resetUrl: `http://localhost:5173/reset-password?token=${token}&email=${email}`,
                    title: 'Reset Password',
                    message: 'Click link để đổi mật khẩu của bạn.',
                }
            }
        );

        return {
            message: 'Reset password email sent',
            token: `${token}`,
        };
    }
}
