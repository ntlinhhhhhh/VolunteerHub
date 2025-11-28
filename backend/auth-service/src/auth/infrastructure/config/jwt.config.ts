import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
    secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    signOptions: { expiresIn: '15m' },
});