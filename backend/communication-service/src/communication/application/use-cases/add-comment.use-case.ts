import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { CreateCommentDto } from '../dto/post.dto';
import { RabbitMQService } from '../../infrastructure/message-bus/rabbitmq.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AddCommentUseCase {
  private readonly logger = new Logger(AddCommentUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async execute(postId: string, dto: CreateCommentDto): Promise<any> {
    this.logger.log(`Adding comment to post ${postId} by user ${dto.authorId}`);

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = {
      id: uuidv4(),
      authorId: dto.authorId,
      authorName: dto.authorName,
      authorAvatar: dto.authorAvatar || null,
      content: dto.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.postRepository.addComment(postId, comment);

    // Publish notification event (don't notify self)
    if (post.authorId !== dto.authorId) {
      await this.rabbitMQService.publishMessage(
        {
          type: 'new_comment_on_post',
          userId: post.authorId, // notify post author
          channels: {
            inApp: true,
          },
          data: {
            eventId: post.eventId,
            postId: post.id,
            postTitle: post.content.substring(0, 50),
            commenterName: dto.authorName,
            commenterId: dto.authorId,
            commentContent: dto.content,
          },
        },
        'event.comment.created',
      );
    }

    this.logger.log(`Comment added to post ${postId}`);
    return comment;
  }
}