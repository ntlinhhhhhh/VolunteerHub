import { Injectable, Inject, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { CreatePostDto } from '../dto/post.dto';
import { RabbitMQService } from '../../infrastructure/message-bus/rabbitmq.service';

@Injectable()
export class CreatePostUseCase {
  private readonly logger = new Logger(CreatePostUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async execute(dto: CreatePostDto): Promise<Post> {
    this.logger.log(`Creating post for event ${dto.eventId} by user ${dto.authorId}`);

    const post = await this.postRepository.create({
      eventId: dto.eventId,
      authorId: dto.authorId,
      authorName: dto.authorName,
      authorAvatar: dto.authorAvatar || null,
      content: dto.content,
      images: dto.images || [],
      videos: dto.videos || [],
      isPinned: false,
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      comments: [],
      lastActivityAt: new Date(),
    } as any);

    // Publish event to RabbitMQ for notifications
    await this.rabbitMQService.publishMessage(
      {
        type: 'new_post_on_event',
        userId: dto.authorId,
        channels: {
          inApp: true,
        },
        data: {
          eventId: dto.eventId,
          postId: post.id,
          postTitle: dto.content.substring(0, 50),
          postContent: dto.content,
          authorName: dto.authorName,
        },
      },
      'event.post.created',
    );

    this.logger.log(`✅ Post created successfully: ${post.id}`);
    return post;
  }
}