import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { Token } from '../../domain/entities/token.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginUseCase {
  private readonly MAX_FAILED_ATTEMPTS = 5;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: cacheManager.Cache,

    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async execute(email: string, password: string): Promise<Token> {

    const auth = await this.authRepository.findByEmail(email);
    if (!auth) {
      throw new UnauthorizedException('No account found with this email');
    }

    if (auth.isAccountLocked()) {
      throw new UnauthorizedException('This account is currently locked');
    }

    const isPasswordValid = await bcrypt.compare(password, auth?.passwordHash);
    if (!isPasswordValid) {

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

    await this.authRepository.updateLastLogin(auth.id);

    const accessToken = this.jwtService.sign(
      {
        userId: auth.id,
        email: auth.email,
        roleId: auth.roleId,
        roleName: 'volunteer',
        permissions: auth.role?.permissions || [],
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }
    );

    const refreshToken = this.jwtService.sign(
      { email: auth.email, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
        subject: auth.id.toString(),
      }
    );

    await this.cache.set(`refresh:${auth.id}`, refreshToken, 7 * 24 * 60 * 60);
    return new Token(accessToken, refreshToken, 900);
  }
}
