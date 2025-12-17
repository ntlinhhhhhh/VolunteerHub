import { Post } from '../entities/post.entity';

export enum PostSortBy {
  LATEST = 'latest', // Bài mới nhất
  MOST_ACTIVE = 'most_active', // Tương tác mới nhất
}

export type PostUpdateData = {
  content?: string;
  images?: string[];
  videos?: string[];
};

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findByEventId(
    eventId: string,
    limit?: number,
    skip?: number,
    sortBy?: PostSortBy,
  ): Promise<Post[]>;
  findPinnedByEventId(eventId: string): Promise<Post[]>;
  create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  update(id: string, updates: PostUpdateData): Promise<Post | null>;
  delete(id: string): Promise<boolean>;
  addLike(postId: string, userId: string): Promise<void>;
  removeLike(postId: string, userId: string): Promise<void>;
  addComment(postId: string, comment: any): Promise<void>;
  updateComment(postId: string, commentId: string, content: string): Promise<void>;
  deleteComment(postId: string, commentId: string): Promise<void>;
  pinPost(postId: string): Promise<void>;
  unpinPost(postId: string): Promise<void>;
  getPostsCount(eventId: string): Promise<number>;
  incrementCommentsCount(postId: string): Promise<void>;
  decrementCommentsCount(postId: string): Promise<void>;
}

export const IPostRepository = Symbol('IPostRepository');