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
    controllers: [],
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

        JwtStrategy,
        JwtAuthGuard,
    ],
    exports: [RabbitMQModule, CacheModule],
})
export class AppModule { }
