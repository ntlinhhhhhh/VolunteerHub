import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { getDatabaseConfig } from './event/infrastructure/config/database.config';
import { EventSchema } from './event/infrastructure/database/schemas/event.schema';
import { DatabaseModule } from './event/infrastructure/database/connection';
// import { EventController } from './event/presentation/controllers/event.controller';
// import { HealthController } from './event/presentation/controllers/health.controller';
import { DatabaseService } from './event/infrastructure/config/database.service';
import { EventRepository } from './event/infrastructure/repositories/event.repository';
import { CreateEventUseCase } from './event/application/use-cases/create-event.use-case';
import { UpdateEventUseCase } from './event/application/use-cases/update-event.use-case';
import { ApproveEventUseCase } from './event/application/use-cases/approve-event.use-case';
import { RejectEventUseCase } from './event/application/use-cases/reject-event.use-case';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
    ]),

    // Redis Cache
    CacheModule.register({
      store: redisStore,
      host: 'redis',
      port: 6379,
      ttl: 0,
    }),

    // Database connection
    DatabaseModule,

    // RabbitMQ for publishing event notifications
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
  ],

  controllers: [
    // EventController,
    // HealthController,
  ],

  providers: [
    DatabaseService,
    EventRepository,
    { provide: 'IEventRepository', useExisting: EventRepository },

    // Use Cases
    CreateEventUseCase,
    UpdateEventUseCase,
    ApproveEventUseCase,
    RejectEventUseCase,
  ],

  exports: [
    RabbitMQModule,
    CacheModule,
  ],
})
export class AppModule {}
