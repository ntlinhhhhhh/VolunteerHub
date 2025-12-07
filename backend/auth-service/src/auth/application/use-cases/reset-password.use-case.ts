import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    ) {
        console.log('✅ ResetPasswordUseCase constructor called');
    }

    async execute(email: string, token: string, newPassword: string) {
        if (!newPassword || newPassword.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }

        const auth = await this.authRepository.findByEmail(email);
        if (!auth) {
            throw new BadRequestException('Invalid email or token');
        }

        if (
            !auth.resetPasswordToken ||
            auth.resetPasswordToken !== token ||
            !auth.resetPasswordExpires ||
            auth.resetPasswordExpires < new Date()
        ) {
            throw new BadRequestException('Token is invalid or expired');
        }

        const isSamePassword = await bcrypt.compare(newPassword, auth.passwordHash);
        if (isSamePassword) {
            throw new BadRequestException('New password must be different from the old password');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await this.authRepository.updateAuth(auth.id, {
            passwordHash: passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        return { message: 'Password reset successfully' };
    }
}