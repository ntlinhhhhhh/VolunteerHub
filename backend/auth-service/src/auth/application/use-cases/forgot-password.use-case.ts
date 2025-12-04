import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { IAuthRepository } from 'src/auth/domain/repositories/auth.repository.interface';
import { EmailService } from 'src/auth/infrastructure/email/email.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string) {
    const auth = await this.authRepository.findByEmail(email);
    if (!auth) throw new NotFoundException('Email not found');

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600_000);

    auth.resetPasswordToken = token;
    auth.resetPasswordExpires = expires;

    await this.authRepository.updateAuth(auth.id, auth);

    await this.emailService.sendResetPassword(email, token);

    return { message: 'Reset password email sent' };
  }
}
