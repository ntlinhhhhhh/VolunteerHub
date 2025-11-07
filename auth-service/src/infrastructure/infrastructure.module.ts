import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth } from 'src/domain/entities/auth.entity';
import { AuthSchema } from './database/schemas/auth.schema';
import { Role, RoleSchema } from './database/schemas/role.schema';
import { AuthRepository } from './repositories/auth.repository';
import { RoleRepository } from './repositories/role.repository';
import { IAuthRepository } from 'src/domain/repositories/auth.repository.interface';
import { IRoleRepository } from 'src/domain/repositories/role.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [
    AuthRepository,
    RoleRepository,
    { provide: IAuthRepository, useExisting: AuthRepository },
    { provide: IRoleRepository, useExisting: RoleRepository },
  ],
  exports: [
    IAuthRepository,
    IRoleRepository,
  ],
})
export class InfrastructureModule {}