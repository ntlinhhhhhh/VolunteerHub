import { Injectable, Inject, ForbiddenException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MessagePublisherService } from '../../infrastructure/messaging/message-publisher.service';

interface CreatePostParams {
    dto: CreatePostDto;
    eventId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
}

@Injectable()
export class CreatePostUseCase {
    private readonly logger = new Logger(CreatePostUseCase.name);

    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository,
        @Inject('EVENT_SERVICE')
        private readonly eventClient: ClientProxy,
        private readonly messagePublisher: MessagePublisherService,
    ) {}

    async execute(params: CreatePostParams): Promise<Post> {
        const { dto, eventId, userId, userName, userAvatar } = params;

        // 1. Verify user is registered for this event
        try {
            const isRegistered = await firstValueFrom(
                this.eventClient.send('check_registration', { eventId, userId })
            );

            if (!isRegistered) {
                throw new ForbiddenException('You must be registered for this event to post');
            }
        } catch (error) {
            this.logger.error(`Failed to verify registration: ${error.message}`);
            throw new ForbiddenException('Unable to verify event registration');
        }

        // 2. Create post
        const postData = {
            eventId,
            author: {
                userId,
                name: userName,
                avatar: userAvatar,
            },
            content: dto.content,
            media: {
                images: dto.images || [],
                videos: dto.videos || [],
            },
            comments: [],
            likes: [],
            isPinned: false,
            isEdited: false,
        };

        const post = await this.postRepository.create(postData as any);

        // 3. Publish event to message bus
        await this.messagePublisher.publishPostCreated(post.id, eventId, userId, userName, dto.content);

        this.logger.log(`Post created: ${post.id} in event: ${eventId}`);

        return post;
    }
}