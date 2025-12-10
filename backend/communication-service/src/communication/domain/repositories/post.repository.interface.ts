import { Post, Comment } from '../entities/post.entity';

export interface PostFilterOptions {
    eventId?: string;
    authorId?: string;
    isPinned?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'likes' | 'comments';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IPostRepository {
    // CRUD
    findById(id: string): Promise<Post | null>;
    findAll(options: PostFilterOptions): Promise<PaginatedResult<Post>>;
    findByEventId(eventId: string, options: PostFilterOptions): Promise<PaginatedResult<Post>>;
    findByAuthor(authorId: string, options: PostFilterOptions): Promise<PaginatedResult<Post>>;
    create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
    update(id: string, post: Partial<Post>): Promise<Post>;
    delete(id: string): Promise<void>;

    // Like operations
    addLike(postId: string, userId: string, userName: string): Promise<void>;
    removeLike(postId: string, userId: string): Promise<void>;
    hasUserLiked(postId: string, userId: string): Promise<boolean>;

    // Comment operations
    addComment(postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment>;
    updateComment(postId: string, commentId: string, content: string): Promise<void>;
    deleteComment(postId: string, commentId: string): Promise<void>;
    getComments(postId: string, page: number, limit: number): Promise<PaginatedResult<Comment>>;

    // Pin operations
    pinPost(eventId: string, postId: string): Promise<void>;
    unpinPost(postId: string): Promise<void>;
    getPinnedPosts(eventId: string): Promise<Post[]>;

    // Statistics
    countByEvent(eventId: string): Promise<number>;
    countByAuthor(authorId: string): Promise<number>;
    getMostLikedPosts(eventId: string, limit: number): Promise<Post[]>;
    getMostCommentedPosts(eventId: string, limit: number): Promise<Post[]>;
}

export const IPostRepository = Symbol('IPostRepository');