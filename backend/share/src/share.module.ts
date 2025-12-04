// share.module.ts
import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './auth/roles.guard';
import { RefreshTokenGuard } from './auth/refresh-token.guard';
import { RefreshTokenStrategy } from './auth/refresh-token.strategy';

@Global()
@Module({
  providers: [
    RolesGuard, 
    RefreshTokenGuard, 
    RefreshTokenGuard,
    RefreshTokenStrategy,
    RolesGuard,
],
  exports: [
    RolesGuard, 
    RefreshTokenGuard,
    RefreshTokenGuard,
    RefreshTokenStrategy,
    RolesGuard,


],
})
export class ShareModule {}
