import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IPostRepository,
  PostSortBy,
  PostUpdateData,
} from '../../domain/repositories/post.repository.interface';
import { Post as PostEntity, Comment as CommentEntity } from '../../domain/entities/post.entity';
import { Post, PostDocument } from '../database/schemas/post.schema';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  private toEntity(doc: PostDocument): PostEntity {
    return new PostEntity(
      doc._id.toString(),
      doc.eventId,
      doc.authorId,
      doc.authorName,
      doc.authorAvatar,
      doc.content,
      doc.images,
      doc.isPinned,
      doc.likesCount,
      doc.commentsCount,
      doc.likedBy,
      doc.comments.map(
        (c) =>
          new CommentEntity(
            c.id,
            doc._id.toString(),
            c.authorId,
            c.authorName,
            c.authorAvatar,
            c.content,
            c.createdAt,
            c.updatedAt,
          ),
      ),
      doc.createdAt,
      doc.updatedAt,
      doc.lastActivityAt,
    );
  }

  async findById(id: string): Promise<PostEntity | null> {
    const doc = await this.postModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByEventId(
    eventId: string,
    limit: number = 20,
    skip: number = 0,
    sortBy: PostSortBy = PostSortBy.LATEST,
  ): Promise<PostEntity[]> {
    const sortField = sortBy === PostSortBy.LATEST ? 'createdAt' : 'lastActivityAt';

    const docs = await this.postModel
      .find({ eventId, isPinned: false })
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findPinnedByEventId(eventId: string): Promise<PostEntity[]> {
    const docs = await this.postModel
      .find({ eventId, isPinned: true })
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async create(data: Omit<PostEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostEntity> {
    const doc = new this.postModel({
      ...data,
      lastActivityAt: new Date(),
    });
    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async update(id: string, updates: PostUpdateData): Promise<PostEntity | null> {
    const doc = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          ...updates,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async addLike(postId: string, userId: string): Promise<void> {
    await this.postModel
      .updateOne(
        { _id: postId },
        {
          $addToSet: { likedBy: userId },
          $inc: { likesCount: 1 },
          $set: { lastActivityAt: new Date() },
        },
      )
      .exec();
  }

  async removeLike(postId: string, userId: string): Promise<void> {
    await this.postModel
      .updateOne(
        { _id: postId },
        {
          $pull: { likedBy: userId },
          $inc: { likesCount: -1 },
        },
      )
      .exec();
  }

  async addComment(postId: string, comment: any): Promise<void> {
    await this.postModel
      .updateOne(
        { _id: postId },
        {
          $push: { comments: comment },
          $inc: { commentsCount: 1 },
          $set: { lastActivityAt: new Date() },
        },
      )
      .exec();
  }

  async updateComment(postId: string, commentId: string, content: string): Promise<void> {
    await this.postModel
      .updateOne(
        { _id: postId, 'comments.id': commentId },
        {
          $set: {
            'comments.$.content': content,
            'comments.$.updatedAt': new Date(),
          },
        },
      )
      .exec();
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await this.postModel
      .updateOne(
        { _id: postId },
        {
          $pull: { comments: { id: commentId } },
          $inc: { commentsCount: -1 },
        },
      )
      .exec();
  }

  async pinPost(postId: string): Promise<void> {
    await this.postModel.updateOne({ _id: postId }, { isPinned: true }).exec();
  }

  async unpinPost(postId: string): Promise<void> {
    await this.postModel.updateOne({ _id: postId }, { isPinned: false }).exec();
  }

  async getPostsCount(eventId: string): Promise<number> {
    return this.postModel.countDocuments({ eventId }).exec();
  }

  async incrementCommentsCount(postId: string): Promise<void> {
    await this.postModel
      .updateOne({ _id: postId }, { $inc: { commentsCount: 1 } })
      .exec();
  }

  async decrementCommentsCount(postId: string): Promise<void> {
    await this.postModel
      .updateOne({ _id: postId }, { $inc: { commentsCount: -1 } })
      .exec();
  }
}