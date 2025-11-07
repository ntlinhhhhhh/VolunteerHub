import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';

import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { RoleRepository } from './infrastructure/repositories/role.repository';

import { Auth, AuthSchema } from './infrastructure/database/schemas/auth.schema';
import { Role, RoleSchema } from './infrastructure/database/schemas/role.schema';

import { IAuthRepository } from './domain/repositories/auth.repository.interface';
import { IRoleRepository } from './domain/repositories/role.repository.interface';

import { getJwtConfig } from './infrastructure/config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: Role.name, schema: RoleSchema },
    ]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],

  controllers: [AuthController],

  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,

    AuthRepository,
    RoleRepository,

    { provide: IAuthRepository, useExisting: AuthRepository },
    { provide: IRoleRepository, useExisting: RoleRepository },
  ],

  exports: [JwtModule, IAuthRepository, IRoleRepository],
})
export class AuthModule {}
