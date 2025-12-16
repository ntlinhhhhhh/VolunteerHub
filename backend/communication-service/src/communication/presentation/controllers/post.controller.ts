import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Param,
    Body,
    Query,
    Headers,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
  import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
  import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
  import { GetPostsUseCase } from '../../application/use-cases/get-posts.use-case';
  import { LikePostUseCase } from '../../application/use-cases/like-post.use-case';
  import { UnlikePostUseCase } from '../../application/use-cases/unlike-post.use-case';
  import { PinPostUseCase } from '../../application/use-cases/pin-post.use-case';
  import { UnpinPostUseCase } from '../../application/use-cases/unpin-post.use-case';
  import { AddCommentUseCase } from '../../application/use-cases/add-comment.use-case';
  import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
  import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
  import {
    CreatePostDto,
    UpdatePostDto,
    CreateCommentDto,
    UpdateCommentDto,
    GetPostsQueryDto,
  } from '../../application/dto/post.dto';
  import { PostSortBy } from '../../domain/repositories/post.repository.interface';
  
  @Controller('events/:eventId/posts')
  export class PostController {
    constructor(
      private readonly createPostUseCase: CreatePostUseCase,
      private readonly updatePostUseCase: UpdatePostUseCase,
      private readonly deletePostUseCase: DeletePostUseCase,
      private readonly getPostsUseCase: GetPostsUseCase,
      private readonly likePostUseCase: LikePostUseCase,
      private readonly unlikePostUseCase: UnlikePostUseCase,
      private readonly pinPostUseCase: PinPostUseCase,
      private readonly unpinPostUseCase: UnpinPostUseCase,
      private readonly addCommentUseCase: AddCommentUseCase,
      private readonly updateCommentUseCase: UpdateCommentUseCase,
      private readonly deleteCommentUseCase: DeleteCommentUseCase,
    ) {}
  
    /**
     * GET /events/:eventId/posts
     * Lấy tất cả posts của event (có pagination và sorting)
     */
    @Get()
    async getPosts(
      @Param('eventId') eventId: string,
      @Query() query: GetPostsQueryDto,
    ) {
      const limit = query.limit ? parseInt(query.limit) : 20;
      const skip = query.skip ? parseInt(query.skip) : 0;
      const sortBy = query.sortBy === 'most_active' ? PostSortBy.MOST_ACTIVE : PostSortBy.LATEST;
  
      const result = await this.getPostsUseCase.execute(eventId, limit, skip, sortBy);
  
      return {
        success: true,
        data: result,
      };
    }
  
    /**
     * GET /events/:eventId/posts/:postId
     * Lấy chi tiết 1 post
     */
    @Get(':postId')
    async getPostById(@Param('postId') postId: string) {
      const post = await this.getPostsUseCase.getById(postId);
      return {
        success: true,
        data: post,
      };
    }
  
    /**
     * POST /events/:eventId/posts
     * Tạo post mới
     */
    @Post()
    async createPost(
      @Param('eventId') eventId: string,
      @Body() dto: CreatePostDto,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-name') userName: string,
      @Headers('x-user-avatar') userAvatar?: string,
    ) {
      const post = await this.createPostUseCase.execute({
        ...dto,
        eventId,
        authorId: userId,
        authorName: userName,
        authorAvatar: userAvatar,
      });
  
      return {
        success: true,
        message: 'Post created successfully',
        data: post,
      };
    }
  
    /**
     * PUT /events/:eventId/posts/:postId
     * Cập nhật post
     */
    @Put(':postId')
    async updatePost(
      @Param('postId') postId: string,
      @Body() dto: UpdatePostDto,
      @Headers('x-user-id') userId: string,
    ) {
      const post = await this.updatePostUseCase.execute(postId, userId, dto);
  
      return {
        success: true,
        message: 'Post updated successfully',
        data: post,
      };
    }
  
    /**
     * DELETE /events/:eventId/posts/:postId
     * Xóa post
     */
    @Delete(':postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePost(
      @Param('postId') postId: string,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-role') userRole?: string,
    ) {
      const isAdmin = userRole === 'admin';
      const isEventManager = userRole === 'event_manager';
  
      await this.deletePostUseCase.execute(postId, userId, isEventManager, isAdmin);
    }
  
    /**
     * POST /events/:eventId/posts/:postId/like
     * Like post
     */
    @Post(':postId/like')
    @HttpCode(HttpStatus.OK)
    async likePost(
      @Param('postId') postId: string,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-name') userName: string,
    ) {
      await this.likePostUseCase.execute(postId, userId, userName);
  
      return {
        success: true,
        message: 'Post liked successfully',
      };
    }
  
    /**
     * DELETE /events/:eventId/posts/:postId/like
     * Unlike post
     */
    @Delete(':postId/like')
    @HttpCode(HttpStatus.OK)
    async unlikePost(
      @Param('postId') postId: string,
      @Headers('x-user-id') userId: string,
    ) {
      await this.unlikePostUseCase.execute(postId, userId);
  
      return {
        success: true,
        message: 'Post unliked successfully',
      };
    }
  
    /**
     * PATCH /events/:eventId/posts/:postId/pin
     * Ghim post
     */
    @Patch(':postId/pin')
    async pinPost(
      @Param('postId') postId: string,
      @Headers('x-user-role') userRole?: string,
    ) {
      const isAdmin = userRole === 'admin';
      const isEventManager = userRole === 'event_manager';
  
      await this.pinPostUseCase.execute(postId, isEventManager, isAdmin);
  
      return {
        success: true,
        message: 'Post pinned successfully',
      };
    }
  
    /**
     * PATCH /events/:eventId/posts/:postId/unpin
     * Bỏ ghim post
     */
    @Patch(':postId/unpin')
    async unpinPost(
      @Param('postId') postId: string,
      @Headers('x-user-role') userRole?: string,
    ) {
      const isAdmin = userRole === 'admin';
      const isEventManager = userRole === 'event_manager';
  
      await this.unpinPostUseCase.execute(postId, isEventManager, isAdmin);
  
      return {
        success: true,
        message: 'Post unpinned successfully',
      };
    }
  
    /**
     * POST /events/:eventId/posts/:postId/comments
     * Thêm comment vào post
     */
    @Post(':postId/comments')
    async addComment(
      @Param('postId') postId: string,
      @Body() dto: CreateCommentDto,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-name') userName: string,
      @Headers('x-user-avatar') userAvatar?: string,
    ) {
      await this.addCommentUseCase.execute(postId, {
        ...dto,
        authorId: userId,
        authorName: userName,
        authorAvatar: userAvatar,
      });
  
      return {
        success: true,
        message: 'Comment added successfully',
      };
    }
  
    /**
     * PUT /events/:eventId/posts/:postId/comments/:commentId
     * Cập nhật comment
     */
    @Put(':postId/comments/:commentId')
    async updateComment(
      @Param('postId') postId: string,
      @Param('commentId') commentId: string,
      @Body() dto: UpdateCommentDto,
      @Headers('x-user-id') userId: string,
    ) {
      await this.updateCommentUseCase.execute(postId, commentId, userId, dto);
  
      return {
        success: true,
        message: 'Comment updated successfully',
      };
    }
  
    /**
     * DELETE /events/:eventId/posts/:postId/comments/:commentId
     * Xóa comment
     */
    @Delete(':postId/comments/:commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(
      @Param('postId') postId: string,
      @Param('commentId') commentId: string,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-role') userRole?: string,
    ) {
      const isAdmin = userRole === 'admin';
      const isEventManager = userRole === 'event_manager';
  
      await this.deleteCommentUseCase.execute(
        postId,
        commentId,
        userId,
        isEventManager,
        isAdmin,
      );
    }
  }