// src/communication/infrastructure/database/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ _id: false })
class PostAuthor {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    avatar?: string;
}

@Schema({ _id: false })
class Comment {
    @Prop({ required: true })
    id: string;

    @Prop({ type: PostAuthor, required: true })
    author: PostAuthor;

    @Prop({ required: true })
    content: string;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;
}

@Schema({ _id: false })
class Like {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true })
    userName: string;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

@Schema({ _id: false })
class Media {
    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [String], default: [] })
    videos: string[];
}

@Schema({ collection: 'posts', timestamps: true })
export class Post {
    @Prop({ required: true, index: true })
    eventId: string;

    @Prop({ type: PostAuthor, required: true })
    author: PostAuthor;

    @Prop({ required: true, maxlength: 5000 })
    content: string;

    @Prop({ type: Media })
    media: Media;

    @Prop({ type: [Comment], default: [] })
    comments: Comment[];

    @Prop({ type: [Like], default: [] })
    likes: Like[];

    @Prop({ default: false, index: true })
    isPinned: boolean;

    @Prop({ default: false })
    isEdited: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for performance
PostSchema.index({ eventId: 1, createdAt: -1 });
PostSchema.index({ eventId: 1, isPinned: -1, createdAt: -1 });
PostSchema.index({ 'author.userId': 1, createdAt: -1 });
PostSchema.index({ content: 'text' });
PostSchema.index({ 'likes.userId': 1 });

// Virtual for likes count
PostSchema.virtual('likesCount').get(function() {
    return this.likes?.length || 0;
});

// Virtual for comments count
PostSchema.virtual('commentsCount').get(function() {
    return this.comments?.length || 0;
});