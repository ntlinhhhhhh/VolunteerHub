import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './auth/roles.guard';
import { RefreshTokenGuard } from './auth/refresh-token.guard';
import { RefreshTokenStrategy } from './auth/refresh-token.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        JwtStrategy,
        RolesGuard,
        RefreshTokenGuard,
        RefreshTokenStrategy,
    ],
    exports: [
        JwtStrategy,
        RolesGuard,
        RefreshTokenGuard,
        RefreshTokenStrategy,
    ],
})
export class ShareModule { }

