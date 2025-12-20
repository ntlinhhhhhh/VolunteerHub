import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { ShareModule } from '@share/share.module';

import { IPostRepository } from './communication/domain/repositories/post.repository.interface';

// Infrastructure
import { DatabaseModule } from './communication/infrastructure/database/connection';
import { PostRepository } from './communication/infrastructure/repositories/post.repository';
import { Post, PostSchema } from './communication/infrastructure/database/schemas/post.schema';
import { RabbitMQService } from './communication/infrastructure/message-bus/rabbitmq.service';
import { DatabaseService } from './communication/infrastructure/config/database.service';

// Application Use Cases
import { CreatePostUseCase } from './communication/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './communication/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './communication/application/use-cases/delete-post.use-case';
import { GetPostsUseCase } from './communication/application/use-cases/get-posts.use-case';
import { LikePostUseCase } from './communication/application/use-cases/like-post.use-case';
import { UnlikePostUseCase } from './communication/application/use-cases/unlike-post.use-case';
import { PinPostUseCase } from './communication/application/use-cases/pin-post.use-case';
import { UnpinPostUseCase } from './communication/application/use-cases/unpin-post.use-case';
import { AddCommentUseCase } from './communication/application/use-cases/add-comment.use-case';
import { UpdateCommentUseCase } from './communication/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './communication/application/use-cases/delete-comment.use-case';

// Presentation
import { PostController } from './communication/presentation/controllers/post.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        DatabaseModule,

        MongooseModule.forRoot(
            process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/communication-service'
        ),

        MongooseModule.forFeature([
            { name: Post.name, schema: PostSchema }
        ]),

        ShareModule,

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
        }),
    ],

    controllers: [PostController],

    providers: [
        DatabaseService,
        RabbitMQService,
        PostRepository,
        { provide: IPostRepository, useClass: PostRepository },

        {
            provide: 'EVENT_SERVICE',
            useFactory: () =>
                ClientProxyFactory.create({
                    transport: Transport.REDIS,
                    options: { host: 'redis', port: 6379 },
                }),
        },

        {
            provide: 'USER_SERVICE',
            useFactory: () =>
                ClientProxyFactory.create({
                    transport: Transport.REDIS,
                    options: { host: 'redis', port: 6379 },
                }),
        },

        // Use Cases
        CreatePostUseCase,
        UpdatePostUseCase,
        DeletePostUseCase,
        GetPostsUseCase,
        LikePostUseCase,
        UnlikePostUseCase,
        PinPostUseCase,
        UnpinPostUseCase,
        AddCommentUseCase,
        UpdateCommentUseCase,
        DeleteCommentUseCase,
    ],
    exports: [
        'USER_SERVICE',
        'EVENT_SERVICE'
    ]
})
export class AppModule { }