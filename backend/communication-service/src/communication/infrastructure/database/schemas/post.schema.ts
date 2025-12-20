import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ _id: false })
export class CommentSchema {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop({ default: null })
  authorAvatar: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const CommentSchemaFactory = SchemaFactory.createForClass(CommentSchema);

@Schema({ collection: 'posts', timestamps: true })
export class Post {
  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop({ default: null })
  authorAvatar: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false, index: true })
  isPinned: boolean;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({ type: [CommentSchemaFactory], default: [] })
  comments: CommentSchema[];

  @Prop({ default: Date.now, index: true })
  lastActivityAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for better query performance
PostSchema.index({ eventId: 1, createdAt: -1 });
PostSchema.index({ eventId: 1, lastActivityAt: -1 });
PostSchema.index({ eventId: 1, isPinned: -1, createdAt: -1 });
