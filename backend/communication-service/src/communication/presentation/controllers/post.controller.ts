// import {
//     Controller,
//     Get,
//     Post,
//     Put,
//     Delete,
//     Patch,
//     Param,
//     Body,
//     Query,
//     Headers,
//     HttpCode,
//     HttpStatus,
//     UseInterceptors,
//     BadRequestException,
//     UploadedFiles,
//     Inject,
//     UseGuards,
//     InternalServerErrorException,
// } from '@nestjs/common';
// import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
// import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';
// import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
// import { GetPostsUseCase } from '../../application/use-cases/get-posts.use-case';
// import { LikePostUseCase } from '../../application/use-cases/like-post.use-case';
// import { UnlikePostUseCase } from '../../application/use-cases/unlike-post.use-case';
// import { PinPostUseCase } from '../../application/use-cases/pin-post.use-case';
// import { UnpinPostUseCase } from '../../application/use-cases/unpin-post.use-case';
// import { AddCommentUseCase } from '../../application/use-cases/add-comment.use-case';
// import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.use-case';
// import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
// import {
//     CreatePostDto,
//     UpdatePostDto,
//     CreateCommentDto,
//     UpdateCommentDto,
//     GetPostsQueryDto,
// } from '../../application/dto/post.dto';
// import { PostSortBy } from '../../domain/repositories/post.repository.interface';
// import { extname } from 'path';
// import { ClientProxy } from '@nestjs/microservices';
// import { firstValueFrom } from 'rxjs';
// import { JwtAuthGuard } from '@share/auth/jwt-auth.guard'
// import { Post as PostEntity } from '../../domain/entities/post.entity';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { GetUser } from '@share/auth/get-user.decorator';
// import { diskStorage } from 'multer';

// @Controller('events/:eventId/posts')
// export class PostController {
//     constructor(
//         private readonly createPostUseCase: CreatePostUseCase,
//         private readonly updatePostUseCase: UpdatePostUseCase,
//         private readonly deletePostUseCase: DeletePostUseCase,
//         private readonly getPostsUseCase: GetPostsUseCase,
//         private readonly likePostUseCase: LikePostUseCase,
//         private readonly unlikePostUseCase: UnlikePostUseCase,
//         private readonly pinPostUseCase: PinPostUseCase,
//         private readonly unpinPostUseCase: UnpinPostUseCase,
//         private readonly addCommentUseCase: AddCommentUseCase,
//         private readonly updateCommentUseCase: UpdateCommentUseCase,
//         private readonly deleteCommentUseCase: DeleteCommentUseCase,
//         @Inject('USER_SERVICE') private userClient: ClientProxy,

//     ) { }

//     /**
//      * GET /events/:eventId/posts
//      * Lấy tất cả posts của event (có pagination và sorting)
//      */
//     @Get()
//     async getPosts(
//         @Param('eventId') eventId: string,
//         @Query() query: GetPostsQueryDto,
//     ) {
//         const limit = query.limit ? parseInt(query.limit) : 20;
//         const skip = query.skip ? parseInt(query.skip) : 0;
//         const sortBy = query.sortBy === 'most_active' ? PostSortBy.MOST_ACTIVE : PostSortBy.LATEST;

//         const result = await this.getPostsUseCase.execute(eventId, limit, skip, sortBy);

//         return {
//             success: true,
//             data: result,
//         };
//     }

//     /**
//      * GET /events/:eventId/posts/:postId
//      * Lấy chi tiết 1 post
//      */
//     @Get(':postId')
//     async getPostById(@Param('postId') postId: string) {
//         const post = await this.getPostsUseCase.getById(postId);
//         return {
//             success: true,
//             data: post,
//         };
//     }

//     /**
//      * POST /events/:eventId/posts
//      * Tạo post mới
//      */
//     // communication-service/src/.../post.controller.ts

//     @Post()
//     @UseGuards(JwtAuthGuard)
//     @UseInterceptors(
//         FilesInterceptor('images', 4, { // 'images' là key từ Frontend gửi lên
//             storage: diskStorage({
//                 destination: './uploads/posts', // Đảm bảo thư mục này tồn tại
//                 filename: (req, file, cb) => {
//                     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//                     const ext = extname(file.originalname);
//                     cb(null, `post-${uniqueSuffix}${ext}`);
//                 },
//             }),
//             limits: { fileSize: 5 * 1024 * 1024 },
//             fileFilter: (req, file, cb) => {
//                 if (!file.mimetype.startsWith('image/')) {
//                     return cb(new BadRequestException('Chỉ cho phép tải lên định dạng ảnh'), false);
//                 }
//                 cb(null, true);
//             },
//         }),
//     )
//     async createPost(
//         @UploadedFiles() files: Express.Multer.File[], // NestJS tự lưu vào storage và trả về thông tin file ở đây
//         @Param('eventId') eventId: string,
//         @Body('content') content: string,
//         @GetUser() auth: any,
//     ) {
//         console.log('Files received:', files)
//         // Nếu files không rỗng, Multer đã lưu ảnh thành công vào thư mục ./uploads/posts
//         const imageUrls = files?.map((file) => `uploads/posts/${file.filename}`) ?? [];

//         // Lấy profile từ User Service (hoặc dùng fallback từ token như đã thảo luận)
//         const userProfile = await firstValueFrom(
//             this.userClient.send('user.findByAuthId', { authId: auth.userId })
//         ).catch(() => null);

//         let authorAvatar = userProfile?.avatar || '';

//         // Nếu path avatar lấy từ user-service có dấu / ở đầu, hãy xóa nó đi
//         if (authorAvatar.startsWith('/')) {
//             authorAvatar = authorAvatar.substring(1);
//         }

//         const post = await this.createPostUseCase.execute({
//             eventId,
//             content,
//             authorId: userProfile?.authId || auth.userId,
//             authorName: userProfile?.fullName || auth.name || 'User',
//             authorAvatar: authorAvatar,
//             images: imageUrls, // Lưu mảng đường dẫn này vào database
//         });

//         return { success: true, data: post };
//     }


//     /**
//      * PUT /events/:eventId/posts/:postId
//      * Cập nhật post
//      */
//     @Put(':postId')
//     async updatePost(
//         @Param('postId') postId: string,
//         @Body() dto: UpdatePostDto,
//         @Headers('x-user-id') userId: string,
//     ) {
//         const post = await this.updatePostUseCase.execute(postId, userId, dto);

//         return {
//             success: true,
//             message: 'Post updated successfully',
//             data: post,
//         };
//     }

//     /**
//      * DELETE /events/:eventId/posts/:postId
//      * Xóa post
//      */
//     @Delete(':postId')
//     @HttpCode(HttpStatus.NO_CONTENT)
//     async deletePost(
//         @Param('postId') postId: string,
//         @Headers('x-user-id') userId: string,
//         @Headers('x-user-role') userRole?: string,
//     ) {
//         const isAdmin = userRole === 'admin';
//         const isEventManager = userRole === 'event_manager';

//         await this.deletePostUseCase.execute(postId, userId, isEventManager, isAdmin);
//     }

//     /**
//      * POST /events/:eventId/posts/:postId/like
//      * Like post
//      */
//     @Post(':postId/like')
//     @HttpCode(HttpStatus.OK)
//     async likePost(
//         @Param('postId') postId: string,
//         @Headers('x-user-id') userId: string,
//         @Headers('x-user-name') userName: string,
//     ) {
//         await this.likePostUseCase.execute(postId, userId, userName);

//         return {
//             success: true,
//             message: 'Post liked successfully',
//         };
//     }

//     /**
//      * DELETE /events/:eventId/posts/:postId/like
//      * Unlike post
//      */
//     @Delete(':postId/like')
//     @HttpCode(HttpStatus.OK)
//     async unlikePost(
//         @Param('postId') postId: string,
//         @Headers('x-user-id') userId: string,
//     ) {
//         await this.unlikePostUseCase.execute(postId, userId);

//         return {
//             success: true,
//             message: 'Post unliked successfully',
//         };
//     }

//     /**
//      * PATCH /events/:eventId/posts/:postId/pin
//      * Ghim post
//      */
//     @Patch(':postId/pin')
//     async pinPost(
//         @Param('postId') postId: string,
//         @Headers('x-user-role') userRole?: string,
//     ) {
//         const isAdmin = userRole === 'admin';
//         const isEventManager = userRole === 'event_manager';

//         await this.pinPostUseCase.execute(postId, isEventManager, isAdmin);

//         return {
//             success: true,
//             message: 'Post pinned successfully',
//         };
//     }

//     /**
//      * PATCH /events/:eventId/posts/:postId/unpin
//      * Bỏ ghim post
//      */
//     @Patch(':postId/unpin')
//     async unpinPost(
//         @Param('postId') postId: string,
//         @Headers('x-user-role') userRole?: string,
//     ) {
//         const isAdmin = userRole === 'admin';
//         const isEventManager = userRole === 'event_manager';

//         await this.unpinPostUseCase.execute(postId, isEventManager, isAdmin);

//         return {
//             success: true,
//             message: 'Post unpinned successfully',
//         };
//     }

//     /**
//      * POST /events/:eventId/posts/:postId/comments
//      * Thêm comment vào post
//      */
//     @Post(':postId/comments')
//     async addComment(
//         @Param('postId') postId: string,
//         @Body() dto: CreateCommentDto,
//         @Headers('x-user-id') userId: string,
//         @Headers('x-user-name') userName: string,
//         @Headers('x-user-avatar') userAvatar?: string,
//     ) {
//         const comment = await this.addCommentUseCase.execute(postId, {
//             ...dto,
//             authorId: userId,
//             authorName: userName,
//             authorAvatar: userAvatar,
//         });

//         return {
//             success: true,
//             message: 'Comment added successfully',
//             data: comment,
//         };
//     }

//     /**
//      * PUT /events/:eventId/posts/:postId/comments/:commentId
//      * Cập nhật comment
//      */
//     @Put(':postId/comments/:commentId')
//     async updateComment(
//         @Param('postId') postId: string,
//         @Param('commentId') commentId: string,
//         @Body() dto: UpdateCommentDto,
//         @Headers('x-user-id') userId: string,
//     ) {
//         await this.updateCommentUseCase.execute(postId, commentId, userId, dto);

//         return {
//             success: true,
//             message: 'Comment updated successfully',
//         };
//     }

//     /**
//      * DELETE /events/:eventId/posts/:postId/comments/:commentId
//      * Xóa comment
//      */
//     @Delete(':postId/comments/:commentId')
//     @HttpCode(HttpStatus.NO_CONTENT)
//     async deleteComment(
//         @Param('postId') postId: string,
//         @Param('commentId') commentId: string,
//         @Headers('x-user-id') userId: string,
//         @Headers('x-user-role') userRole?: string,
//     ) {
//         const isAdmin = userRole === 'admin';
//         const isEventManager = userRole === 'event_manager';

//         await this.deleteCommentUseCase.execute(
//             postId,
//             commentId,
//             userId,
//             isEventManager,
//             isAdmin,
//         );
//     }
// }


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
    UseInterceptors,
    BadRequestException,
    UploadedFiles,
    Inject,
    UseGuards,
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
import { extname } from 'path';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard'
import { Post as PostEntity } from '../../domain/entities/post.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetUser } from '@share/auth/get-user.decorator';
import { diskStorage } from 'multer';

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
        @Inject('USER_SERVICE') private userClient: ClientProxy,
    ) { }

    /**
     * Hàm chuẩn hóa đường dẫn ảnh
     * Đảm bảo đường dẫn luôn đúng format: /uploads/...
     */
    private normalizePath(path: string): string {
        if (!path) return '';
        
        // Nếu đã là URL đầy đủ thì giữ nguyên
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        
        // Loại bỏ các ký tự lạ ở đầu
        let cleanPath = path.trim();
        
        // Đảm bảo luôn có dấu / ở đầu
        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }
        
        return cleanPath;
    }

    /**
     * Hàm chuẩn hóa dữ liệu post trước khi trả về client
     */
    private normalizePostData(post: any): any {
        return {
            ...post,
            id: post.id || post._id,
            authorAvatar: this.normalizePath(post.authorAvatar || ''),
            images: (post.images || []).map((img: string) => this.normalizePath(img)),
            comments: (post.comments || []).map((comment: any) => ({
                ...comment,
                id: comment.id || comment._id,
                authorAvatar: this.normalizePath(comment.authorAvatar || '')
            }))
        };
    }

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

        // Chuẩn hóa dữ liệu trước khi trả về
        const normalizedResult = {
            posts: (result.posts || []).map(post => this.normalizePostData(post)),
            pinnedPosts: (result.pinnedPosts || []).map(post => this.normalizePostData(post)),
            total: result.total || 0,
            skip: skip,
            limit: limit
        };

        return {
            success: true,
            data: normalizedResult,
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
            data: this.normalizePostData(post),
        };
    }

    /**
     * POST /events/:eventId/posts
     * Tạo post mới với upload ảnh
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FilesInterceptor('images', 4, {
            storage: diskStorage({
                destination: './uploads/posts',
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const ext = extname(file.originalname);
                    cb(null, `post-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { 
                fileSize: 5 * 1024 * 1024, // 5MB
            },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    return cb(new BadRequestException('Chỉ cho phép tải lên định dạng ảnh'), false);
                }
                cb(null, true);
            },
        }),
    )
    async createPost(
        @UploadedFiles() files: Express.Multer.File[],
        @Param('eventId') eventId: string,
        @Body('content') content: string,
        @GetUser() auth: any,
    ) {
        console.log('📸 Files received:', files);
        console.log('👤 Auth user:', auth);
        
        // Tạo mảng đường dẫn ảnh với format chuẩn
        const imageUrls = files?.map((file) => `/uploads/posts/${file.filename}`) ?? [];
        
        console.log('🖼️ Image URLs to save:', imageUrls);

        const userProfile = await firstValueFrom(
            this.userClient.send('user.findByAuthId', { authId: auth.userId })
        ).catch(() => null);
        
        let authorAvatar = userProfile?.avatar || '/uploads/avatars/default.png';
        authorAvatar = this.normalizePath(authorAvatar);

        // Tạo post
        const post = await this.createPostUseCase.execute({
            eventId,
            content,
            authorId: userProfile?.authId || auth.userId,
            authorName: userProfile?.fullName || auth.name || 'User',
            authorAvatar: authorAvatar,
            images: imageUrls,
        });

        console.log('✅ Post created successfully:', post);

        return { 
            success: true, 
            data: this.normalizePostData(post)
        };
    }

    /**
     * PUT /events/:eventId/posts/:postId
     * Cập nhật post
     */
    @Put(':postId')
    @UseGuards(JwtAuthGuard)
    async updatePost(
        @Param('postId') postId: string,
        @Body() dto: UpdatePostDto,
        @GetUser() auth: any,
    ) {
        const userId = auth.userId;
        const post = await this.updatePostUseCase.execute(postId, userId, dto);

        return {
            success: true,
            message: 'Post updated successfully',
            data: this.normalizePostData(post),
        };
    }

    /**
     * DELETE /events/:eventId/posts/:postId
     * Xóa post
     */
    @Delete(':postId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePost(
        @Param('postId') postId: string,
        @GetUser() auth: any,
    ) {
        const userId = auth.userId;
        const userRole = auth.role || 'volunteer';
        const isAdmin = userRole === 'admin';
        const isEventManager = userRole === 'event_manager';

        await this.deletePostUseCase.execute(postId, userId, isEventManager, isAdmin);
    }

    /**
     * POST /events/:eventId/posts/:postId/like
     * Like post
     */
    @Post(':postId/like')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async likePost(
        @Param('postId') postId: string,
        @GetUser() auth: any,
    ) {
        const userId = auth.userId;
        const userName = auth.name || 'User';
        
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async unlikePost(
        @Param('postId') postId: string,
        @GetUser() auth: any,
    ) {
        const userId = auth.userId;
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
    @UseGuards(JwtAuthGuard)
    async pinPost(
        @Param('postId') postId: string,
        @GetUser() auth: any,
    ) {
        const userRole = auth.role || 'volunteer';
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
    @UseGuards(JwtAuthGuard)
    async unpinPost(
        @Param('postId') postId: string,
        @GetUser() auth: any,
    ) {
        const userRole = auth.role || 'volunteer';
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
    @UseGuards(JwtAuthGuard)
    async addComment(
        @Param('postId') postId: string,
        @Body() dto: CreateCommentDto,
        @GetUser() auth: any,
    ) {
        const userId = auth.userId;
        const userName = auth.name || 'User';
        
        // Lấy avatar từ user service nếu có
        let userAvatar = '/uploads/avatars/default.png';
        try {
            const userProfile = await firstValueFrom(
                this.userClient.send('user.findByAuthId', { authId: userId })
            );
            if (userProfile?.avatar) {
                userAvatar = this.normalizePath(userProfile.avatar);
            }
        } catch (error) {
            console.warn('Could not fetch user avatar:', error.message);
        }

        const comment = await this.addCommentUseCase.execute(postId, {
            ...dto,
            authorId: userId,
            authorName: userName,
            authorAvatar: userAvatar,
        });

        return {
            success: true,
            message: 'Comment added successfully',
            data: {
                ...comment,
                id: comment.id || comment._id,
                authorAvatar: this.normalizePath(comment.authorAvatar || '')
            },
        };
    }

    /**
     * PUT /events/:eventId/posts/:postId/comments/:commentId
     * Cập nhật comment
     */
    @Put(':postId/comments/:commentId')
    @UseGuards(JwtAuthGuard)
    async updateComment(
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateCommentDto,
        @GetUser() auth: any,
    ) {
        const userId = auth.userId;
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @GetUser() auth: any,
    ) {
        const userId = auth.userId;
        const userRole = auth.role || 'volunteer';
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
