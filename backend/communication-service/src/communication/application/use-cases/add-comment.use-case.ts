import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Comment } from '../../domain/entities/post.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AddCommentUseCase {
    private readonly logger = new Logger(AddCommentUseCase.name);

    constructor(
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository,
        private readonly amqp: AmqpConnection,
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
        await this.amqp.publish('notification_exchange', 'comment.created', {
            type: 'new_comment',
            postId,
            postAuthorId: post.author.userId,
            commentId: comment.id,
            commentAuthorId: userId,
            commentAuthorName: userName,
            content: dto.content.substring(0, 100),
        });

        this.logger.log(`Comment added: ${comment.id} on post: ${postId}`);

        return comment;
    }
}
