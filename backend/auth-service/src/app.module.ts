// import { CacheModule } from '@nestjs/cache-manager';
// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { JwtModule, JwtService } from '@nestjs/jwt';
// import { ClientProxyFactory, Transport } from '@nestjs/microservices';
// import { MongooseModule } from '@nestjs/mongoose';
// import { LoginUseCase } from './auth/application/use-cases/login.use-case';
// import { LogOutUseCase } from './auth/application/use-cases/logout.use-case';
// import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.use-case';
// import { RegisterUseCase } from './auth/application/use-cases/register.use-case';
// import { ValidateTokenUseCase } from './auth/application/use-cases/validate-token.use-case';
// import { getDatabaseConfig } from './auth/infrastructure/config/database.config';
// import { DatabaseService } from './auth/infrastructure/config/database.service';
// import { getJwtConfig } from './auth/infrastructure/config/jwt.config';
// import { DatabaseModule } from './auth/infrastructure/database/connection';
// import { Auth, AuthSchema } from './auth/infrastructure/database/schemas/auth.schema';
// import { Role, RoleSchema } from './auth/infrastructure/database/schemas/role.schema';
// import { GoogleAuthService } from './auth/infrastructure/google/google-auth.service';
// import { InfrastructureModule } from './auth/infrastructure/infrastructure.module';
// import { AuthRepository } from './auth/infrastructure/repositories/auth.repository';
// import { RoleRepository } from './auth/infrastructure/repositories/role.repository';
// import { AuthController } from './auth/presentation/controllers/auth.controller';
// import { HealthController } from './auth/presentation/controllers/health.controller';

// const redisStore = require('cache-manager-redis-store');
// @Module({
//     imports: [
//         ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
//         MongooseModule.forRootAsync({
//             inject: [ConfigService],
//             useFactory: getDatabaseConfig,
//         }),
//         MongooseModule.forFeature([
//             { name: Auth.name, schema: AuthSchema },
//             { name: Role.name, schema: RoleSchema },
//         ]),
//         JwtModule.registerAsync({
//             inject: [ConfigService],
//             useFactory: getJwtConfig,
//         }),
//         CacheModule.registerAsync({
//             useFactory: async () => ({
//                 store: await redisStore({
//                     socket: {
//                         host: 'redis',   // tên container redis
//                         port: 6379,
//                     },
//                     ttl: 0,
//                 }),
//             }),
//         }),
//         DatabaseModule,
//         InfrastructureModule,
//     ],
//     controllers: [AuthController, HealthController],
//     providers: [
//         AuthRepository,
//         RoleRepository,
//         { provide: 'IAuthRepository', useExisting: AuthRepository },
//         { provide: 'IRoleRepository', useExisting: RoleRepository },
//         DatabaseService,
//         RegisterUseCase,
//         LoginUseCase,
//         RefreshTokenUseCase,
//         ValidateTokenUseCase,
//         LogOutUseCase,
//         {
//             provide: 'USER_SERVICE',
//             useFactory: () => ClientProxyFactory.create({
//                 transport: Transport.REDIS,
//                 options: { host: 'redis', port: 6379 },
//             }),
//         },
//     ],
//     exports: [
//         RegisterUseCase,
//         LoginUseCase,
//         RefreshTokenUseCase,
//         ValidateTokenUseCase,
//         LogOutUseCase,
//         'USER_SERVICE',
//     ],
// })
// export class AppModule { }

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
import { getJwtConfig } from './auth/infrastructure/config/jwt.config';
import { DatabaseModule } from './auth/infrastructure/database/connection';
import { Auth, AuthSchema } from './auth/infrastructure/database/schemas/auth.schema';
import { Role, RoleSchema } from './auth/infrastructure/database/schemas/role.schema';
import { InfrastructureModule } from './auth/infrastructure/infrastructure.module';
import { AuthRepository } from './auth/infrastructure/repositories/auth.repository';
import { RoleRepository } from './auth/infrastructure/repositories/role.repository';
import { AuthController } from './auth/presentation/controllers/auth.controller';
import { HealthController } from './auth/presentation/controllers/health.controller';

// Import đúng với version mới
import * as redisStore from 'cache-manager-redis-store';

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
    CacheModule.register({
      store: redisStore,
      host: 'redis',
      port: 6379,
      ttl: 0,
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
    LogOutUseCase,
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
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    LogOutUseCase,
    'USER_SERVICE',
  ],
})
export class AppModule {}
