import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../../domain/entities/token.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
        private readonly configService: ConfigService,
    ) { console.log('✅ RefreshTokenUseCase constructor called'); }

    async execute(refreshToken: string): Promise<Token> {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Invalid token type');
            }

            const userId = payload.sub;

            const stored = await this.cache.get(`refresh:${userId}`);

            if (!stored || stored !== refreshToken) {
                throw new UnauthorizedException('Refresh token mismatch or expired');
            }

            const auth = await this.authRepository.findById(userId);
            if (!auth) {
                throw new UnauthorizedException('User not found');
            }

            if (auth.isAccountLocked()) {
                throw new UnauthorizedException('Your account is currently locked');
            }

            const accessToken = this.jwtService.sign(
                {
                    userId: auth.id,
                    email: auth.email,
                    roleId: auth.roleId,
                    roleName: auth.role?.name,
                    permissions: auth.role?.permissions || [],
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: '15m'
                }
            );

            const newRefreshToken = this.jwtService.sign(
            { userId: auth.id, type: 'refresh' },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
                subject: auth.id.toString(),
            }
        );

            await this.cache.set(`refresh:${auth.id}`, newRefreshToken, 7 * 24 * 60 * 60);
            console.log('Stored refresh token in cache:', await this.cache.get(`refresh:${payload.userId}`));

            return new Token(accessToken, newRefreshToken, 900);
        } catch (error) {
            console.error('RefreshToken error:', error);
            throw new UnauthorizedException('Refresh token is invalid or expired');
        }
    }
}