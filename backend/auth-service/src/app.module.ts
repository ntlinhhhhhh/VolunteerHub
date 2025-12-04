import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginUseCase } from './auth/application/use-cases/login.use-case';
import { LogOutUseCase } from './auth/application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from './auth/application/use-cases/register.use-case';
import { ValidateTokenUseCase } from './auth/application/use-cases/validate-token.use-case';
import { getDatabaseConfig } from './auth/infrastructure/config/database.config';
import { DatabaseService } from './auth/infrastructure/config/database.service';
import { DatabaseModule } from './auth/infrastructure/database/connection';
import { Auth, AuthSchema } from './auth/infrastructure/database/schemas/auth.schema';
import { Role, RoleSchema } from './auth/infrastructure/database/schemas/role.schema';
import { InfrastructureModule } from './auth/infrastructure/infrastructure.module';
import { AuthRepository } from './auth/infrastructure/repositories/auth.repository';
import { RoleRepository } from './auth/infrastructure/repositories/role.repository';
import { AuthController } from './auth/presentation/controllers/auth.controller';
import { HealthController } from './auth/presentation/controllers/health.controller';
import * as redisStore from 'cache-manager-redis-store';
import { PassportModule } from '@nestjs/passport';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { JwtStrategy } from '@share/auth/jwt.strategy'
import { GoogleController } from './auth/presentation/controllers/google.controller';
import { GoogleAuthService } from './auth/infrastructure/google/google-auth.service';
import { EmailService } from './auth/infrastructure/email/email.service';
import { GoogleLoginUseCase } from './auth/application/use-cases/google-login.use-case';
import { ForgotPasswordUseCase } from './auth/application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './auth/application/use-cases/reset-password.use-case';
import { AdminLoginUseCase } from './auth/application/use-cases/admin-login.use-case';
import { EventManagerLoginUseCase } from './auth/application/use-cases/event-manager.use-case';
import { ShareModule } from '@share/share.module'
import { RefreshTokenStrategy } from '@share/auth/refresh-token.strategy'

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
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_ACCESS_SECRET'),
            signOptions: { expiresIn: '15m' },
        }),
    }),
    
    CacheModule.register({
      store: redisStore,
      host: 'redis',
      port: 6379,
      ttl: 0,
    }),
    DatabaseModule,
    InfrastructureModule,
    RabbitMQModule.forRootAsync({
        useFactory: () => ({
            uri: 'amqp://rabbitmq:5672',
            exchanges: [
            {
                name: 'notification_exchange',
                type: 'topic',
            },
            ],
        }),
    }),
    ShareModule,
  ],
  controllers: [AuthController, HealthController, GoogleController],
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
    GoogleAuthService,
    EmailService,
    GoogleLoginUseCase,
    ForgotPasswordUseCase,
    LogOutUseCase,
    ResetPasswordUseCase,
    AdminLoginUseCase,
    EventManagerLoginUseCase,
    JwtStrategy,
    RefreshTokenStrategy,
    {
      provide: 'USER_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: { host: 'redis', port: 6379 },
        }),
    },
  ],
  exports: [
    'USER_SERVICE',
    JwtModule,
    PassportModule,
    JwtStrategy,
    RabbitMQModule,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    LogOutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    AdminLoginUseCase,
    EventManagerLoginUseCase,
  ],
})
export class AppModule {}
