
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { randomUUID } from 'crypto'; 
import {
    IPostRepository,
    PostFilterOptions,
    PaginatedResult,
} from '../../domain/repositories/post.repository.interface';
import { Post as PostEntity, Comment } from '../../domain/entities/post.entity';
import { Post as PostSchema, PostDocument } from '../database/schemas/post.schema';

@Injectable()
export class PostRepository implements IPostRepository {
    constructor(
        @InjectModel(PostSchema.name)
        private readonly postModel: Model<PostDocument>
    ) {}

    private toEntity(doc: PostDocument): PostEntity {
        return new PostEntity(
            doc._id.toString(),
            doc.eventId,
            doc.author,
            doc.content,
            doc.media,
            doc.comments,
            doc.likes,
            doc.isPinned,
            doc.isEdited,
            doc.createdAt,
            doc.updatedAt
        );
    }

    async findById(id: string): Promise<PostEntity | null> {
        const doc = await this.postModel.findById(id).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findAll(options: PostFilterOptions): Promise<PaginatedResult<PostEntity>> {
        const query: FilterQuery<PostDocument> = {};

        if (options.eventId) {
            query.eventId = options.eventId;
        }

        if (options.authorId) {
            query['author.userId'] = options.authorId;
        }

        if (options.isPinned !== undefined) {
            query.isPinned = options.isPinned;
        }

        if (options.search) {
            query.$text = { $search: options.search };
        }

        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        const sortField = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        
        let sort: any;
        if (sortField === 'likes') {
            sort = { 'likes': sortOrder, createdAt: -1 };
        } else if (sortField === 'comments') {
            sort = { 'comments': sortOrder, createdAt: -1 };
        } else {
            sort = { isPinned: -1, [sortField]: sortOrder };
        }

        const [docs, total] = await Promise.all([
            this.postModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
            this.postModel.countDocuments(query).exec(),
        ]);

        return {
            data: docs.map(doc => this.toEntity(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByEventId(
        eventId: string,
        options: PostFilterOptions
    ): Promise<PaginatedResult<PostEntity>> {
        return this.findAll({ ...options, eventId });
    }

    async findByAuthor(
        authorId: string,
        options: PostFilterOptions
    ): Promise<PaginatedResult<PostEntity>> {
        return this.findAll({ ...options, authorId });
    }

    async create(post: any): Promise<PostEntity> {
        const doc = new this.postModel(post);
        const saved = await doc.save();
        return this.toEntity(saved);
    }

    async update(id: string, post: Partial<PostEntity>): Promise<PostEntity> {
        const doc = await this.postModel
            .findByIdAndUpdate(
                id,
                { $set: { ...post, isEdited: true, updatedAt: new Date() } },
                { new: true }
            )
            .exec();

        if (!doc) {
            throw new Error('Post not found');
        }

        return this.toEntity(doc);
    }

    async delete(id: string): Promise<void> {
        await this.postModel.findByIdAndDelete(id).exec();
    }

    async addLike(postId: string, userId: string, userName: string): Promise<void> {
        await this.postModel
            .updateOne(
                { 
                    _id: postId,
                    'likes.userId': { $ne: userId }
                },
                {
                    $push: {
                        likes: {
                            userId,
                            userName,
                            createdAt: new Date(),
                        },
                    },
                }
            )
            .exec();
    }

    async removeLike(postId: string, userId: string): Promise<void> {
        await this.postModel
            .updateOne(
                { _id: postId },
                {
                    $pull: {
                        likes: { userId },
                    },
                }
            )
            .exec();
    }

    async hasUserLiked(postId: string, userId: string): Promise<boolean> {
        const count = await this.postModel
            .countDocuments({
                _id: postId,
                'likes.userId': userId,
            })
            .exec();
        return count > 0;
    }

    async addComment(
        postId: string,
        comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Comment> {
        const newComment: Comment = {
            id: randomUUID(),
            ...comment,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.postModel
            .updateOne(
                { _id: postId },
                {
                    $push: {
                        comments: newComment,
                    },
                }
            )
            .exec();

        return newComment;
    }

    async updateComment(postId: string, commentId: string, content: string): Promise<void> {
        await this.postModel
            .updateOne(
                {
                    _id: postId,
                    'comments.id': commentId,
                },
                {
                    $set: {
                        'comments.$.content': content,
                        'comments.$.updatedAt': new Date(),
                    },
                }
            )
            .exec();
    }

    async deleteComment(postId: string, commentId: string): Promise<void> {
        await this.postModel
            .updateOne(
                { _id: postId },
                {
                    $pull: {
                        comments: { id: commentId },
                    },
                }
            )
            .exec();
    }

    async getComments(
        postId: string,
        page: number,
        limit: number
    ): Promise<PaginatedResult<Comment>> {
        const post = await this.postModel.findById(postId).exec();
        
        if (!post) {
            return { data: [], total: 0, page, limit, totalPages: 0 };
        }

        const comments = post.comments || [];
        const total = comments.length;
        const skip = (page - 1) * limit;
        const data = comments.slice(skip, skip + limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async pinPost(eventId: string, postId: string): Promise<void> {
        await this.postModel
            .updateMany({ eventId }, { $set: { isPinned: false } })
            .exec();

        await this.postModel
            .updateOne({ _id: postId }, { $set: { isPinned: true } })
            .exec();
    }

    async unpinPost(postId: string): Promise<void> {
        await this.postModel
            .updateOne({ _id: postId }, { $set: { isPinned: false } })
            .exec();
    }

    async getPinnedPosts(eventId: string): Promise<PostEntity[]> {
        const docs = await this.postModel
            .find({ eventId, isPinned: true })
            .sort({ createdAt: -1 })
            .exec();

        return docs.map(doc => this.toEntity(doc));
    }

    async countByEvent(eventId: string): Promise<number> {
        return await this.postModel.countDocuments({ eventId }).exec();
    }

    async countByAuthor(authorId: string): Promise<number> {
        return await this.postModel.countDocuments({ 'author.userId': authorId }).exec();
    }

    async getMostLikedPosts(eventId: string, limit: number): Promise<PostEntity[]> {
        const docs = await this.postModel
            .find({ eventId })
            .sort({ 'likes': -1, createdAt: -1 })
            .limit(limit)
            .exec();

        return docs.map(doc => this.toEntity(doc));
    }

    async getMostCommentedPosts(eventId: string, limit: number): Promise<PostEntity[]> {
        const docs = await this.postModel
            .find({ eventId })
            .sort({ 'comments': -1, createdAt: -1 })
            .limit(limit)
            .exec();

        return docs.map(doc => this.toEntity(doc));
    }
}