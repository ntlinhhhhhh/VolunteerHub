import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { Token } from '../../domain/entities/token.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

@Injectable()
export class LoginUseCase {
  private readonly MAX_FAILED_ATTEMPTS = 5;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: cacheManager.Cache,

    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,

    private readonly jwtService: JwtService
  ) {}

  async execute(email: string, password: string): Promise<Token> {

    // 1. Find user by email
    const auth = await this.authRepository.findByEmail(email);
    if (!auth) {
      throw new UnauthorizedException('No account found with this email');
    }

    // 2. Check if account is locked
    if (auth.isAccountLocked()) {
      throw new UnauthorizedException('This account is currently locked');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, auth?.passwordHash);
    if (!isPasswordValid) {

      // Incorrect password --> increment attempts
      const attempts = await this.authRepository.incrementFailedLoginAttempts(auth.id);

      if (attempts >= this.MAX_FAILED_ATTEMPTS) {
        await this.authRepository.lockAccount(
          auth.id,
          `Account locked after ${attempts} failed login attempts`
        );
        throw new UnauthorizedException(
          `Account has been locked after ${attempts} unsuccessful login attempts`
        );
      }

      throw new UnauthorizedException(
        `Invalid email or password. You have ${this.MAX_FAILED_ATTEMPTS - attempts} attempts left.`
      );
    }

    // 4. Update last login timestamp
    await this.authRepository.updateLastLogin(auth.id);

    // 5. Generate JWT payload
    const payload = {
      userId: auth.id,
      email: auth.email,
      roleId: auth.roleId,
      roleName: auth.role?.name,
      permission: auth.role?.permissions || [],
      isLocked: auth.isLocked
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { userId: auth.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    

    return new Token(accessToken, refreshToken, 900);
  }
}
