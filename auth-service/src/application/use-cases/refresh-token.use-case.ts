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
      // 1. verify refresh token
      const payload = this.jwtService.verify(refreshToken);

      // 2. check type token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token invalid');
      }

      // 3. find user by payload.id
      const auth = await this.authRepository.findById(payload.userId);
      if (!auth) {
        throw new UnauthorizedException('User not found');
      }

      if (auth.isAccountLocked()) {
        throw new UnauthorizedException('Your account is locked');
      }

      // gen token
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
      throw new UnauthorizedException('Refresh token invalid or  het han');
    }
  }
}