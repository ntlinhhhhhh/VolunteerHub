import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { UpdateCommentDto } from '../dto/post.dto';

@Injectable()
export class UpdateCommentUseCase {
  private readonly logger = new Logger(UpdateCommentUseCase.name);

  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(
    postId: string,
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<void> {
    this.logger.log(`Updating comment ${commentId} on post ${postId}`);

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (!comment.canBeEditedBy(userId)) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    await this.postRepository.updateComment(postId, commentId, dto.content);
    this.logger.log(` Comment ${commentId} updated successfully`);
  }
}
