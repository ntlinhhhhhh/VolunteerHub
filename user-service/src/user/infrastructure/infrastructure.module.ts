import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './database/schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from 'user/domain/repositories/user.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    UserRepository,
    { provide: IUserRepository, useExisting: UserRepository },
  ],
  exports: [
    IUserRepository,
  ],
})
export class InfrastructureModule {}