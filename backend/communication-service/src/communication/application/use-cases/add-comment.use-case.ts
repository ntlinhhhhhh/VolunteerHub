import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Comment } from '../../domain/entities/post.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { MessagePublisherService } from '../../infrastructure/messaging/message-publisher.service';

@Injectable()
export class AddCommentUseCase {
    private readonly logger = new Logger(AddCommentUseCase.name);

    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository,
        private readonly messagePublisher: MessagePublisherService,
    ) {}

    async execute(
        postId: string,
        dto: CreateCommentDto,
        userId: string,
        userName: string,
        userAvatar?: string
    ): Promise<Comment> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const comment = await this.postRepository.addComment(postId, {
            author: {
                userId,
                name: userName,
                avatar: userAvatar,
            },
            content: dto.content,
        });

        // Notify post author
        await this.messagePublisher.publishCommentAdded({
            postId,
            commentId: comment.id,
            authorId: userId,
            content: dto.content,
            createdAt: comment.createdAt,
        });

        this.logger.log(`Comment added: ${comment.id} on post: ${postId}`);

        return comment;
    }
}
