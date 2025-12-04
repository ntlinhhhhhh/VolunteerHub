import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { IAuthRepository } from 'src/auth/domain/repositories/auth.repository.interface';

@Injectable()
export class ResetPasswordUseCase {
  constructor(@Inject('IAuthRepository')private readonly authRepository: IAuthRepository) {}

  async execute(email: string, token: string, newPassword: string) {
    const auth = await this.authRepository.findByEmail(email);
    if (!auth) throw new BadRequestException('Invalid email or token');

    if (
      !auth.resetPasswordToken ||
      auth.resetPasswordToken !== token ||
      !auth.resetPasswordExpires ||
      auth.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Token is invalid or expired');
    }

    auth.passwordHash = await bcrypt.hash(newPassword, 10);
    auth.resetPasswordToken = null;
    auth.resetPasswordExpires = null;

    await this.authRepository.updateAuth(auth.id, auth);

    return { message: 'Password reset successfully' };
  }
}
