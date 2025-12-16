import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class PinPostUseCase {
  private readonly logger = new Logger(PinPostUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(
    postId: string,
    isEventManager: boolean = false,
    isAdmin: boolean = false,
  ): Promise<void> {
    this.logger.log(`Pinning post ${postId}`);

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.canBePinnedBy(isEventManager, isAdmin)) {
      throw new ForbiddenException('Only event managers or admins can pin posts');
    }

    if (post.isPinned) {
      this.logger.warn(`Post ${postId} is already pinned`);
      return;
    }

    await this.postRepository.pinPost(postId);
    this.logger.log(`Post ${postId} pinned successfully`);
  }
}