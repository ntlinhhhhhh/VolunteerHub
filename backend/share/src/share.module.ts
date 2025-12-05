import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './auth/roles.guard';
import { RefreshTokenGuard } from './auth/refresh-token.guard';
import { RefreshTokenStrategy } from './auth/refresh-token.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        RolesGuard,
        RefreshTokenGuard,
        RefreshTokenStrategy,
    ],
    exports: [
        RolesGuard,
        RefreshTokenGuard,
        RefreshTokenStrategy,
    ],
})
export class ShareModule { }

