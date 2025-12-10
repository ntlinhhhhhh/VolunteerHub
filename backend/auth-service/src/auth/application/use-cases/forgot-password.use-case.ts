import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { MessagePublisherService } from 'src/auth/infrastructure/messaging/message-publisher.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class ForgotPasswordUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        private readonly messagePublisherService: MessagePublisherService,
        @Inject('USER_SERVICE') private userClient: ClientProxy,
    ) { console.log('✅ ForgotPasswordUseCase constructor called'); }

    async execute(email: string) {
        const auth = await this.authRepository.findByEmail(email);
        if (!auth) throw new NotFoundException('Email not found');

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600_000);

        auth.resetPasswordToken = token;
        auth.resetPasswordExpires = expires;

        await this.authRepository.updateAuth(auth.id, auth);

        const user = await firstValueFrom(
            this.userClient.send('user.findByEmail', {
                email: email,
            }));

        await this.messagePublisherService.publishResetPassword(auth.id, email, token, user.fullName);
        
        return {
            message: 'Reset password email sent',
            token: `${token}`,
        };
    }
}
