import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { getDatabaseConfig } from './auth/infrastructure/config/database.config';
import { DatabaseModule } from './auth/infrastructure/database/connection';
import { InfrastructureModule } from './auth/infrastructure/infrastructure.module';
import { DatabaseService } from './auth/infrastructure/config/database.service';
import { AuthController } from 'auth/presentation/controllers/auth.controller';
import { HealthController } from 'auth/presentation/controllers/health.controller';
import { RegisterUseCase } from 'auth/application/use-cases/register.use-case';
import { LoginUseCase } from 'auth/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from 'auth/application/use-cases/refresh-token.use-case';
import { ValidateTokenUseCase } from 'auth/application/use-cases/validate-token.use-case';
import { Auth } from 'auth/domain/entities/auth.entity';
import { AuthSchema } from 'auth/infrastructure/database/schemas/auth.schema';
import { Role, RoleSchema } from 'auth/infrastructure/database/schemas/role.schema';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'auth/infrastructure/config/jwt.config';
import { AuthRepository } from 'auth/infrastructure/repositories/auth.repository';
import { RoleRepository } from 'auth/infrastructure/repositories/role.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    DatabaseModule,
    InfrastructureModule,
  ],
  controllers: [AuthController, HealthController],
  providers: [
    AuthRepository,
    RoleRepository,
    { provide: 'IAuthRepository', useExisting: AuthRepository },
    { provide: 'IRoleRepository', useExisting: RoleRepository },
    DatabaseService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    {
      provide: 'USER_SERVICE',
      useFactory: () => ClientProxyFactory.create({
        transport: Transport.REDIS,
        options: { host: 'redis', port: 6379 },
      }),
    },
  ],
  exports: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    'USER_SERVICE',
  ],
})
export class AppModule {}
