import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ShareModule } from '@share/share.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { getDatabaseConfig } from './event/infrastructure/config/database.config';
import { EventSchema } from './event/infrastructure/database/schemas/event.schema';

import { DatabaseModule } from './event/infrastructure/database/connection';
import { DatabaseService } from './event/infrastructure/config/database.service';

import { EventRepository } from './event/infrastructure/repositories/event.repository';
import { EventCategoryRepository } from './event/infrastructure/repositories/event-category.repository'; // ⬅ thêm

import { IEventRepository } from './event/domain/repositories/event.repository.interface';
import { IEventCategoryRepository } from './event/domain/repositories/event-category.repository.interface'; // ⬅ thêm

import { CreateEventUseCase } from './event/application/use-cases/create-event.use-case';
import { UpdateEventUseCase } from './event/application/use-cases/update-event.use-case';
import { ApproveEventUseCase } from './event/application/use-cases/approve-event.use-case';
import { RejectEventUseCase } from './event/application/use-cases/reject-event.use-case';
import { CreateCategoryUseCase } from './event/application/use-cases/create-category.use-case';

import { EventController } from './event/presentation/controllers/event.controller';
import { CategoryController } from './event/presentation/controllers/category.controller';
import { EventCategory } from './event/domain/entities/event-category.entity';
import { EventCategorySchema } from './event/infrastructure/database/schemas/event-category.schema';
import { SubmitEventForApprovalUseCase } from './event/application/use-cases/submit-event-for-approval.use-case';
import { PublishEventUseCase } from './event/application/use-cases/publish-event.use-case';
import { CancelEventUseCase } from './event/application/use-cases/cancel-event.use-case';
import { DeleteEventUseCase } from './event/application/use-cases/delete-event.use-case';
import { GetEventByIdUseCase } from './event/application/use-cases/get-event-by-id.use-case';
import { GetEventBySlugUseCase } from './event/application/use-cases/get-event-by-slug.use-case';
import { ListEventsUseCase } from './event/application/use-cases/list-events.use-case';
import { GetEventStatisticsUseCase } from './event/application/use-cases/get-event-statistics.use-case';
import { ListCategoriesUseCase } from './event/application/use-cases/list-categories.use-case';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from '@share/auth/jwt.strategy'; // import strategy từ share
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard'; // import guard từ share
import { EventCategorySeeder } from './event/infrastructure/database/seed/event-category.seed';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // Mongoose
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: getDatabaseConfig,
        }),
        MongooseModule.forFeature([
            { name: Event.name, schema: EventSchema },
            { name: EventCategory.name, schema: EventCategorySchema },
        ]),
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
                exchanges: [{ name: 'notification_exchange', type: 'topic' }],
            }),
        }),
        ShareModule,
    ],
    controllers: [EventController, CategoryController],
    providers: [
        {
            provide: 'USER_SERVICE',
            useFactory: () =>
                ClientProxyFactory.create({
                    transport: Transport.REDIS,
                    options: { host: 'redis', port: 6379 },
                }),
        },
        DatabaseService,

        // Repository Providers
        { provide: IEventRepository, useClass: EventRepository },
        { provide: IEventCategoryRepository, useClass: EventCategoryRepository },

        // Use Cases
        CreateEventUseCase,
        UpdateEventUseCase,
        ApproveEventUseCase,
        RejectEventUseCase,
        SubmitEventForApprovalUseCase,
        PublishEventUseCase,
        CancelEventUseCase,
        DeleteEventUseCase,
        GetEventByIdUseCase,
        GetEventBySlugUseCase,
        ListEventsUseCase,
        GetEventStatisticsUseCase,
        CreateCategoryUseCase,
        ListCategoriesUseCase,
        EventCategorySeeder,

        // ⬅ Thêm chiến lược JWT và guard để @GetUser() hoạt động
        JwtStrategy,
        JwtAuthGuard,
    ],
    exports: [RabbitMQModule, CacheModule],
})
export class AppModule { }
