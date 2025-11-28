import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../../domain/entities/token.entity';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository
  ) {}

  async execute(refreshToken: string): Promise<Token> {
    try {
      // 1. Verify refresh token
      const payload = this.jwtService.verify(refreshToken);
      // const stored = await this.cache.get(`refresh:${payload.sub}`);

      // 2. Check token type
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // 3. Find user by ID from payload
      const auth = await this.authRepository.findById(payload.userId);
      if (!auth) {
        throw new UnauthorizedException('User not found');
      }

      if (auth.isAccountLocked()) {
        throw new UnauthorizedException('Your account is currently locked');
      }

      // 4. Generate new tokens
      const accessToken = this.jwtService.sign(
        {
          userId: auth.id,
          email: auth.email,
          roleId: auth.roleId,
          roleName: auth.role?.name,
          permissions: auth.role?.permissions || [],
        },
        { expiresIn: '15m' }
      );

      const newRefreshToken = this.jwtService.sign(
        { userId: auth.id, type: 'refresh' },
        { expiresIn: '7d' }
      );

      return new Token(accessToken, newRefreshToken, 900);
    } catch (error) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }
}