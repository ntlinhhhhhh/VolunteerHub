import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class UnlikePostUseCase {
  private readonly logger = new Logger(UnlikePostUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    this.logger.log(`User ${userId} unliking post ${postId}`);

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.hasLikedBy(userId)) {
      this.logger.warn(`User ${userId} has not liked post ${postId}`);
      return;
    }

    await this.postRepository.removeLike(postId, userId);
    this.logger.log(`User ${userId} unliked post ${postId}`);
  }
}
