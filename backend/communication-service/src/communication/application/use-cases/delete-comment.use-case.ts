import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class DeleteCommentUseCase {
  private readonly logger = new Logger(DeleteCommentUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(
    postId: string,
    commentId: string,
    userId: string,
    isEventManager: boolean = false,
    isAdmin: boolean = false,
  ): Promise<void> {
    this.logger.log(`Deleting comment ${commentId} from post ${postId}`);

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (!comment.canBeDeletedBy(userId, isEventManager, isAdmin)) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.postRepository.deleteComment(postId, commentId);
    this.logger.log(`Comment ${commentId} deleted successfully`);
  }
}