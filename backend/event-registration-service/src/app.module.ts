import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ShareModule } from '@share/share.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { JwtStrategy } from '@share/auth/jwt.strategy';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';
import { Registration } from './event-registration/domain/entities/registration.entity';
import { RegistrationSchema } from './event-registration/infrastructure/database/schema/registration.schema';
import { DatabaseModule } from './event-registration/infrastructure/database/database.module';
import { DatabaseService } from './event-registration/infrastructure/config/database.service';
import { getDatabaseConfig } from './event-registration/infrastructure/config/database.config';
import { PassportModule } from '@nestjs/passport';
import { ApplyForEventUseCase } from './event-registration/application/use-cases/apply-for-event.use-case';
import { AcceptRegistrationUseCase } from './event-registration/application/use-cases/accept-registration.use-case';
import { RejectRegistrationUseCase } from './event-registration/application/use-cases/reject-registration.use-case';
import { CancelRegistrationUseCase } from './event-registration/application/use-cases/cancel-registration.use-case';
import { CheckInRegistrationUseCase } from './event-registration/application/use-cases/check-in-registration.use-case';
import { CheckOutRegistrationUseCase } from './event-registration/application/use-cases/check-out-registration.use-case';
import { CompleteRegistrationUseCase } from './event-registration/application/use-cases/complete-registration.use-case';
import { RateEventUseCase } from './event-registration/application/use-cases/rate-event.use-case';
import { ListRegistrationsUseCase } from './event-registration/application/use-cases/list-registrations.use-case';
import { RateVolunteerUseCase } from './event-registration/application/use-cases/rate-volunteer.use-case';
import { GetRegistrationByIdUseCase } from './event-registration/application/use-cases/get-registration-by-id.use-case';
import { GetVolunteerStatisticsUseCase } from './event-registration/application/use-cases/get-volunteer-statistics.use-case';
import { SyncVolunteerInfoUseCase } from './event-registration/application/use-cases/sync-volunteer-info.use-case';
import { HandleEventCancelledUseCase } from './event-registration/application/use-cases/handle-event-cancelled.use-case';
import { RegistrationController } from './event-registration/presentation/controller/registration.controller';
import { IRegistrationRepository } from './event-registration/domain/repositories/registration.repository.interface';
import { RegistrationRepository } from './event-registration/infrastructure/repositories/registration.repository';
import { ConfirmAttendanceUseCase } from './event-registration/application/use-cases/confirm-attendance.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: getDatabaseConfig,
        }),
        MongooseModule.forFeature([
            { name: Registration.name, schema: RegistrationSchema },
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
    controllers: [RegistrationController],
    providers: [
        {
            provide: 'USER_SERVICE',
            useFactory: () =>
                ClientProxyFactory.create({
                    transport: Transport.REDIS,
                    options: { host: 'redis', port: 6379 },
                }),
        },
        {
            provide: 'EVENT_SERVICE',
            useFactory: () =>
                ClientProxyFactory.create({
                    transport: Transport.REDIS,
                    options: { host: 'redis', port: 6379 },
                }),
        },

        { provide: IRegistrationRepository, useClass: RegistrationRepository },


        DatabaseService,
        JwtStrategy,
        JwtAuthGuard,
        ApplyForEventUseCase,
        AcceptRegistrationUseCase,
        RejectRegistrationUseCase,
        CancelRegistrationUseCase,
        CheckInRegistrationUseCase,
        CheckOutRegistrationUseCase,
        CompleteRegistrationUseCase,
        RateEventUseCase,
        RateVolunteerUseCase,
        ListRegistrationsUseCase,
        GetRegistrationByIdUseCase,
        GetVolunteerStatisticsUseCase,
        SyncVolunteerInfoUseCase,
        HandleEventCancelledUseCase,
        ConfirmAttendanceUseCase,
        JwtStrategy,
        JwtAuthGuard,
    ],
    exports: [
        'EVENT_SERVICE',
        'USER_SERVICE',
        RabbitMQModule, 
        CacheModule
    ],
})
export class AppModule { }
