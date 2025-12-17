import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { RabbitMQService } from '../../infrastructure/message-bus/rabbitmq.service';

@Injectable()
export class LikePostUseCase {
  private readonly logger = new Logger(LikePostUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async execute(postId: string, userId: string, userName: string): Promise<void> {
    this.logger.log(`User ${userId} liking post ${postId}`);

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.hasLikedBy(userId)) {
      this.logger.warn(`User ${userId} already liked post ${postId}`);
      return;
    }

    await this.postRepository.addLike(postId, userId);

    // Publish notification event (don't notify self)
    if (post.authorId !== userId) {
      await this.rabbitMQService.publishMessage(
        {
          type: 'post_liked',
          userId: post.authorId, // notify post author
          channels: {
            inApp: true,
          },
          data: {
            eventId: post.eventId,
            postId: post.id,
            likerName: userName,
            likerId: userId,
          },
        },
        'event.post.liked',
      );
    }

    this.logger.log(` User ${userId} liked post ${postId}`);
  }
}