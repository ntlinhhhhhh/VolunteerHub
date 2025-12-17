import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { UpdatePostDto } from '../dto/post.dto';

@Injectable()
export class UpdatePostUseCase {
  private readonly logger = new Logger(UpdatePostUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(postId: string, userId: string, dto: UpdatePostDto): Promise<Post> {
    this.logger.log(`Updating post ${postId} by user ${userId}`);

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.canBeEditedBy(userId)) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updated = await this.postRepository.update(postId, {
      content: dto.content,
      images: dto.images !== undefined ? dto.images : post.images,
    });

    if (!updated) {
      throw new Error('Failed to update post');
    }

    this.logger.log(` Post updated successfully: ${postId}`);
    return updated;
  }
}