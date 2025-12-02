import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { UserController } from './user/presentation/controllers/user.controller';
import { CreateUserUseCase } from './user/application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from './user/application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './user/application/use-cases/update-user-profile.use-case';
import { UserRepository } from './user/infrastructure/repositories/user.repository';
import { IUserRepository } from './user/domain/repositories/user.repository.interface';
import { User, UserSchema } from './user/infrastructure/database/schemas/user.schema';
import { JwtStrategy } from './user/infrastructure/strategies/jwt.strategy';
import { GetUserUseCase } from 'user/application/use-cases/get-user.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/user-service'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    GetUserUseCase,
    { provide: IUserRepository, useClass: UserRepository },
    JwtStrategy,
  ],
})
export class AppModule {}
