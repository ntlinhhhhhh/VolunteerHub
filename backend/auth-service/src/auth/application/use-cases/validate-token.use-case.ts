import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidateTokenUseCase {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        console.log('✅ ValidateTokenUseCase constructor called');
    }

    async execute(token: string, tokenType: 'access' | 'refresh' = 'access'): Promise<{
        valid: boolean;
        userId?: string;
        email?: string;
        roleId?: string;
        roleName?: string;
    }> {
        try {
            const secret = tokenType === 'access'
                ? this.configService.get<string>('JWT_ACCESS_SECRET')
                : this.configService.get<string>('JWT_REFRESH_SECRET');

            const payload = this.jwtService.verify(token, { secret });

            return {
                valid: true,
                userId: payload.userId || payload.sub,
                email: payload.email,
                roleId: payload.roleId,
                roleName: payload.roleName,
            };
        } catch (error) {
            console.error('Token validation error:', error.message);
            return { valid: false };
        }
    }
}