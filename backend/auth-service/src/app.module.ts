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
import { DatabaseService } from './auth/infrastructure/config/database.service';
import { DatabaseModule } from './auth/infrastructure/database/connection';
import { Auth, AuthSchema } from './auth/infrastructure/database/schemas/auth.schema';
import { Role, RoleSchema } from './auth/infrastructure/database/schemas/role.schema';
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
import { GoogleLoginUseCase } from './auth/application/use-cases/google-login.use-case';
import { ForgotPasswordUseCase } from './auth/application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './auth/application/use-cases/reset-password.use-case';
import { AdminLoginUseCase } from './auth/application/use-cases/admin-login.use-case';
import { EventManagerLoginUseCase } from './auth/application/use-cases/event-manager.use-case';
import { ShareModule } from '@share/share.module'
import { RefreshTokenStrategy } from '@share/auth/refresh-token.strategy'
import { LockUserUseCase } from './auth/application/use-cases/lock-user.use-case';
import { UnlockUserUseCase } from './auth/application/use-cases/unlock-user.use-case';
import { AUTH_REPOSITORY } from './auth/domain/repositories/auth.repository.interface';
import { ROLE_REPOSITORY } from './auth/domain/repositories/role.repository.interface';
import { CreateAdminUseCase } from './auth/application/use-cases/create-admin.use-case';
import { getDatabaseConfig } from './auth/infrastructure/config/database.config';


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
        { provide: AUTH_REPOSITORY, useClass: AuthRepository },
        { provide: ROLE_REPOSITORY, useClass: RoleRepository },

        RegisterUseCase,
        CreateAdminUseCase,
        LoginUseCase,
        RefreshTokenUseCase,
        ValidateTokenUseCase,
        GoogleLoginUseCase,
        ForgotPasswordUseCase,
        ResetPasswordUseCase,
        AdminLoginUseCase,
        EventManagerLoginUseCase,
        LockUserUseCase,
        UnlockUserUseCase,
        LogOutUseCase,

        // Services
        DatabaseService,
        GoogleAuthService,
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
        ConfigService,
    ],
    exports: [
        'USER_SERVICE',
        AUTH_REPOSITORY,
        ROLE_REPOSITORY,
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
        LockUserUseCase,
        UnlockUserUseCase,
    ],
})
export class AppModule { }