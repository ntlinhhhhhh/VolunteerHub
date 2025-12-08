import { Injectable, Inject, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class DeletePostUseCase {
    private readonly logger = new Logger(DeletePostUseCase.name);

    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository
    ) {}

    async execute(postId: string, userId: string, isAdmin: boolean = false): Promise<void> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (!isAdmin && !post.isOwnedBy(userId)) {
            throw new ForbiddenException('You can only delete your own posts');
        }

        await this.postRepository.delete(postId);

        this.logger.log(`Post deleted: ${postId} by user: ${userId}`);
    }
}