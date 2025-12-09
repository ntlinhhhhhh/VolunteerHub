import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '../../domain/entities/post.entity';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@Injectable()
export class UpdatePostUseCase {
    private readonly logger = new Logger(UpdatePostUseCase.name);

    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository
    ) {}

    async execute(
        postId: string,
        dto: UpdatePostDto,
        userId: string
    ): Promise<Post> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (!post.isOwnedBy(userId)) {
            throw new ForbiddenException('You can only edit your own posts');
        }

        if (!post.canBeEdited()) {
            throw new ForbiddenException('Post can only be edited within 30 minutes');
        }

        const updatedPost = await this.postRepository.update(postId, dto as any);

        this.logger.log(`Post updated: ${postId} by user: ${userId}`);

        return updatedPost;
    }
}