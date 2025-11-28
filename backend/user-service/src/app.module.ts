import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateUserUseCase } from 'user/application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from 'user/application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from 'user/application/use-cases/update-user-profile.use-case';
import { User } from 'user/domain/entities/user.entity';
import { IUserRepository } from 'user/domain/repositories/user.repository.interface';
import { UserSchema } from 'user/infrastructure/database/schemas/user.schema';
import { UserRepository } from 'user/infrastructure/repositories/user.repository';
import { UserController } from 'user/presentation/controllers/user.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        MongooseModule.forRoot(
            process.env.MONGO_URI || '//volunteer-mongo:27017/user-service'
        ),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [UserController],
    providers: [
        CreateUserUseCase,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
        { provide: IUserRepository, useClass: UserRepository },
        UserRepository,
    ],
    exports: [IUserRepository],
})
export class AppModule { }