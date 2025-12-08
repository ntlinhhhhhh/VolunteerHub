import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ShareModule } from '@share/share.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';

import { getDatabaseConfig } from './communication/infrastructure/config/database.config';
import { PostSchema } from './communication/infrastructure/database/schemas/post.schema';

import { DatabaseModule } from './communication/infrastructure/database/connection';
import { DatabaseService } from './communication/infrastructure/config/database.service';

import { PostRepository } from './communication/infrastructure/repositories/post.repository';
import { IPostRepository } from './communication/domain/repositories/post.repository.interface';

import { CreatePostUseCase } from './communication/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './communication/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './communication/application/use-cases/delete-post.use-case';
import { ToggleLikeUseCase } from './communication/application/use-cases/toggle-like.use-case';
import { AddCommentUseCase } from './communication/application/use-cases/add-comment.use-case';
import { ListPostsUseCase } from './communication/application/use-cases/list-posts.use-case';

import { PostController } from './communication/presentation/controllers/post.controller';

import { JwtStrategy } from '@share/auth/jwt.strategy';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';
import { Post } from './communication/domain/entities/post.entity';

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
            { name: Post.name, schema: PostSchema },
        ]),
        
        // Redis Cache
        CacheModule.register({
            store: redisStore,
            host: 'redis',
            port: 6379,
            ttl: 0,
        }),
        
        DatabaseModule,
        
        // RabbitMQ
        RabbitMQModule.forRootAsync({
            useFactory: () => ({
                uri: 'amqp://rabbitmq:5672',
                exchanges: [
                    { name: 'notification_exchange', type: 'topic' },
                ],
            }),
        }),
        
        ShareModule,
    ],
    controllers: [PostController],
    providers: [
        // Microservice clients
        {
            provide: 'EVENT_SERVICE',
            useFactory: () =>
                ClientProxyFactory.create({
                    transport: Transport.REDIS,
                    options: { host: 'redis', port: 6379 },
                }),
        },
        
        DatabaseService,

        // Repository Providers
        { provide: IPostRepository, useClass: PostRepository },

        // Use Cases
        CreatePostUseCase,
        UpdatePostUseCase,
        DeletePostUseCase,
        ToggleLikeUseCase,
        AddCommentUseCase,
        ListPostsUseCase,

        // Repository
        PostRepository,
        
        // Auth
        JwtStrategy,
        JwtAuthGuard,
    ],
    exports: [RabbitMQModule, CacheModule],
})
export class AppModule {}