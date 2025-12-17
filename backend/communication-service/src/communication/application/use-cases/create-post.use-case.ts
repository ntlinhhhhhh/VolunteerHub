import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { CreatePostDto } from '../dto/post.dto';
import { RabbitMQService } from '../../infrastructure/message-bus/rabbitmq.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CreatePostUseCase {
  private readonly logger = new Logger(CreatePostUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
    private readonly rabbitMQService: RabbitMQService,
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
  ) {}

  async execute(dto: CreatePostDto): Promise<Post> {
    this.logger.log(`Creating post for event ${dto.eventId} by user ${dto.authorId}`);

    // Validate that the event exists
    try {
      const eventResponse = await firstValueFrom(
        this.eventClient.send('event.getById', { eventId: dto.eventId })
      );

      if (!eventResponse.success || !eventResponse.data) {
        throw new BadRequestException('Event not found. Cannot create post for non-existent event.');
      }
    } catch (error) {
      this.logger.error(`Failed to validate event ${dto.eventId}: ${error.message}`);
      throw new BadRequestException('Event not found. Cannot create post for non-existent event.');
    }

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