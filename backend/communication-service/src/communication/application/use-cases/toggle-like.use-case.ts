import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class ToggleLikeUseCase {
    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository
    ) {}

    async execute(postId: string, userId: string, userName: string): Promise<boolean> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const hasLiked = await this.postRepository.hasUserLiked(postId, userId);

        if (hasLiked) {
            await this.postRepository.removeLike(postId, userId);
            return false; // unliked
        } else {
            await this.postRepository.addLike(postId, userId, userName);
            return true; // liked
        }
    }
}
