import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { ToggleLikeUseCase } from '../../application/use-cases/toggle-like.use-case';
import { AddCommentUseCase } from '../../application/use-cases/add-comment.use-case';
import { ListPostsUseCase } from '../../application/use-cases/list-posts.use-case';
import { CreatePostDto } from '../../application/dto/create-post.dto';
import { UpdatePostDto } from '../../application/dto/update-post.dto';
import { CreateCommentDto } from '../../application/dto/create-comment.dto';
import { FilterPostDto } from '../../application/dto/filter-post.dto';
import { Public } from '@share/auth/public.decorator';
import { Roles } from '@share/auth/roles.decorator';
import { GetUser } from '@share/auth/get-user.decorator';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';
import { IPostRepository } from 'src/communication/domain/repositories/post.repository.interface';
import { Inject } from '@nestjs/common';

@Controller('posts')
export class PostController {
    constructor(
        private readonly createPostUseCase: CreatePostUseCase,
        private readonly updatePostUseCase: UpdatePostUseCase,
        private readonly deletePostUseCase: DeletePostUseCase,
        private readonly toggleLikeUseCase: ToggleLikeUseCase,
        private readonly addCommentUseCase: AddCommentUseCase,
        private readonly listPostsUseCase: ListPostsUseCase,
        @Inject(IPostRepository)
        private readonly postRepository: IPostRepository,
    ) {}

    /**
     * PUBLIC: Get posts for an event
     * GET /api/posts?eventId=...
     */
    @Public()
    @Get()
    async listPosts(@Query() filterDto: FilterPostDto) {
        const result = await this.listPostsUseCase.execute(filterDto);

        return {
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }

    /**
     * PUBLIC: Get post by ID
     * GET /api/posts/:id
     */
    @Public()
    @Get(':id')
    async getPostById(@Param('id') id: string) {
        const post = await this.postRepository.findById(id);

        return {
            success: true,
            data: post,
        };
    }

    /**
     * AUTHENTICATED: Create post
     * POST /api/posts/event/:eventId
     */
    @Post('event/:eventId')
    @UseGuards(JwtAuthGuard)
    async createPost(
        @Param('eventId') eventId: string,
        @Body() createPostDto: CreatePostDto,
        @GetUser('userId') userId: string,
        @GetUser() user: any
    ) {
        const post = await this.createPostUseCase.execute({
            dto: createPostDto,
            eventId,
            userId,
            userName: user.name,
            userAvatar: user.avatar,
        });

        return {
            success: true,
            message: 'Post created successfully',
            data: post,
        };
    }

    /**
     * AUTHENTICATED: Update post
     * PUT /api/posts/:id
     */
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updatePost(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto,
        @GetUser('userId') userId: string
    ) {
        const post = await this.updatePostUseCase.execute(id, updatePostDto, userId);

        return {
            success: true,
            message: 'Post updated successfully',
            data: post,
        };
    }

    /**
     * AUTHENTICATED: Delete post
     * DELETE /api/posts/:id
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePost(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
        @GetUser('roleName') role: string
    ) {
        const isAdmin = role === 'admin';
        await this.deletePostUseCase.execute(id, userId, isAdmin);
    }

    /**
     * AUTHENTICATED: Toggle like on post
     * POST /api/posts/:id/like
     */
    @Post(':id/like')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async toggleLike(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
        @GetUser('name') userName: string
    ) {
        const liked = await this.toggleLikeUseCase.execute(id, userId, userName);

        return {
            success: true,
            message: liked ? 'Post liked' : 'Post unliked',
            data: { liked },
        };
    }

    /**
     * AUTHENTICATED: Add comment to post
     * POST /api/posts/:id/comments
     */
    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    async addComment(
        @Param('id') id: string,
        @Body() createCommentDto: CreateCommentDto,
        @GetUser('userId') userId: string,
        @GetUser() user: any
    ) {
        const comment = await this.addCommentUseCase.execute(
            id,
            createCommentDto,
            userId,
            user.name,
            user.avatar
        );

        return {
            success: true,
            message: 'Comment added successfully',
            data: comment,
        };
    }

    /**
     * PUBLIC: Get comments for a post
     * GET /api/posts/:id/comments
     */
    @Public()
    @Get(':id/comments')
    async getComments(
        @Param('id') id: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20
    ) {
        const result = await this.postRepository.getComments(id, page, limit);

        return {
            success: true,
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }

    /**
     * ADMIN/EVENT_MANAGER: Pin post
     * POST /api/posts/:id/pin
     */
    @Post(':id/pin')
    @UseGuards(JwtAuthGuard)
    @Roles('admin', 'event_manager')
    @HttpCode(HttpStatus.OK)
    async pinPost(@Param('id') id: string) {
        const post = await this.postRepository.findById(id);
        
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        await this.postRepository.pinPost(post.eventId, id);

        return {
            success: true,
            message: 'Post pinned successfully',
        };
    }

    /**
     * ADMIN/EVENT_MANAGER: Unpin post
     * POST /api/posts/:id/unpin
     */
    @Post(':id/unpin')
    @UseGuards(JwtAuthGuard)
    @Roles('admin', 'event_manager')
    @HttpCode(HttpStatus.OK)
    async unpinPost(@Param('id') id: string) {
        await this.postRepository.unpinPost(id);

        return {
            success: true,
            message: 'Post unpinned successfully',
        };
    }

    /**
     * AUTHENTICATED: Update comment
     * PUT /api/posts/:postId/comments/:commentId
     */
    @Put(':postId/comments/:commentId')
    @UseGuards(JwtAuthGuard)
    async updateComment(
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @Body() updateCommentDto: UpdateCommentDto,
        @GetUser('userId') userId: string
    ) {
        const post = await this.postRepository.findById(postId);
        
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const comment = post.comments.find(c => c.id === commentId);
        
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.author.userId !== userId) {
            throw new ForbiddenException('You can only edit your own comments');
        }

        await this.postRepository.updateComment(postId, commentId, updateCommentDto.content);

        return {
            success: true,
            message: 'Comment updated successfully',
        };
    }

    /**
     * AUTHENTICATED: Delete comment
     * DELETE /api/posts/:postId/comments/:commentId
     */
    @Delete(':postId/comments/:commentId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @GetUser('userId') userId: string,
        @GetUser('roleName') role: string
    ) {
        const post = await this.postRepository.findById(postId);
        
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const comment = post.comments.find(c => c.id === commentId);
        
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const isAdmin = role === 'admin';
        const isPostOwner = post.author.userId === userId;
        const isCommentOwner = comment.author.userId === userId;

        if (!isAdmin && !isPostOwner && !isCommentOwner) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.postRepository.deleteComment(postId, commentId);
    }
}

import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateCommentDto } from 'src/communication/application/dto/update-comment.dto';