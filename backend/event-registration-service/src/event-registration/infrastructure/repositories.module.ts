import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { IRegistrationRepository } from '../domain/repositories/registration.repository.interface';
import { RegistrationRepository } from './repositories/registration.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: IRegistrationRepository,
      useClass: RegistrationRepository,
    },
  ],
  exports: [IRegistrationRepository],
})
export class RepositoriesModule {}