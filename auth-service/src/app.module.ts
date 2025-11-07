import { Module } from '@nestjs/common';
import { DatabaseService } from './infrastructure/config/database.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth.module';
import { getDatabaseConfig } from './infrastructure/config/database.config';
import { DatabaseModule } from './infrastructure/database/connection';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    DatabaseModule,
    InfrastructureModule,
    AuthModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
