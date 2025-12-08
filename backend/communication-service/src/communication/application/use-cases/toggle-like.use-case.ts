import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { MessagePublisherService } from '../../infrastructure/messaging/message-publisher.service';

@Injectable()
export class ToggleLikeUseCase {
    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository,
        private readonly messagePublisher: MessagePublisherService,
    ) {}

    async execute(postId: string, userId: string, userName: string): Promise<boolean> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const hasLiked = await this.postRepository.hasUserLiked(postId, userId);

        if (hasLiked) {
            await this.postRepository.removeLike(postId, userId);
            await this.messagePublisher.publishLikeToggled(postId, userId, 'unlike');
            return false; // unliked
        } else {
            await this.postRepository.addLike(postId, userId, userName);
            await this.messagePublisher.publishLikeToggled(postId, userId, 'like');
            return true; // liked
        }
    }
}
