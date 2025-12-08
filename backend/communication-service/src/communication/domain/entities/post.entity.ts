export interface PostAuthor {
    userId: string;
    name: string;
    avatar?: string;
}

export interface Comment {
    id: string;
    author: PostAuthor;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Like {
    userId: string;
    userName: string;
    createdAt: Date;
}

export class Post {
    constructor(
        public readonly id: string,
        public readonly eventId: string,
        public readonly author: PostAuthor,
        public readonly content: string,
        public readonly media: {
            images: string[];
            videos: string[];
        },
        public readonly comments: Comment[],
        public readonly likes: Like[],
        public readonly isPinned: boolean,
        public readonly isEdited: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {}

    // Business logic methods
    isOwnedBy(userId: string): boolean {
        return this.author.userId === userId;
    }

    hasLikedBy(userId: string): boolean {
        return this.likes.some(like => like.userId === userId);
    }

    getLikesCount(): number {
        return this.likes.length;
    }

    getCommentsCount(): number {
        return this.comments.length;
    }

    // chi cho sua trong vong 30 phut dau sau khi dang bai
    canBeEdited(): boolean {
        const thirtyMinutes = 30 * 60 * 1000;
        const elapsed = Date.now() - this.createdAt.getTime();
        return elapsed < thirtyMinutes;
    }

    // Immutable update methods
    addLike(userId: string, userName: string): Post {
        if (this.hasLikedBy(userId)) {
            return this;
        }

        return new Post(
            this.id,
            this.eventId,
            this.author,
            this.content,
            this.media,
            this.comments,
            [...this.likes, { userId, userName, createdAt: new Date() }],
            this.isPinned,
            this.isEdited,
            this.createdAt,
            new Date()
        );
    }

    removeLike(userId: string): Post {
        return new Post(
            this.id,
            this.eventId,
            this.author,
            this.content,
            this.media,
            this.comments,
            this.likes.filter(like => like.userId !== userId),
            this.isPinned,
            this.isEdited,
            this.createdAt,
            new Date()
        );
    }

    addComment(comment: Comment): Post {
        return new Post(
            this.id,
            this.eventId,
            this.author,
            this.content,
            this.media,
            [...this.comments, comment],
            this.likes,
            this.isPinned,
            this.isEdited,
            this.createdAt,
            new Date()
        );
    }

    updateComment(commentId: string, newContent: string): Post {
        return new Post(
            this.id,
            this.eventId,
            this.author,
            this.content,
            this.media,
            this.comments.map(c =>
                c.id === commentId
                    ? { ...c, content: newContent, updatedAt: new Date() }
                    : c
            ),
            this.likes,
            this.isPinned,
            this.isEdited,
            this.createdAt,
            new Date()
        );
    }

    deleteComment(commentId: string): Post {
        return new Post(
            this.id,
            this.eventId,
            this.author,
            this.content,
            this.media,
            this.comments.filter(c => c.id !== commentId),
            this.likes,
            this.isPinned,
            this.isEdited,
            this.createdAt,
            new Date()
        );
    }

    pin(): Post {
        return new Post(
            this.id,
            this.eventId,
            this.author,
            this.content,
            this.media,
            this.comments,
            this.likes,
            true,
            this.isEdited,
            this.createdAt,
            new Date()
        );
    }

    unpin(): Post {
        return new Post(
            this.id,
            this.eventId,
            this.author,
            this.content,
            this.media,
            this.comments,
            this.likes,
            false,
            this.isEdited,
            this.createdAt,
            new Date()
        );
    }
}