export class Post {
    constructor(
      public readonly id: string,
      public readonly eventId: string,
      public readonly authorId: string,
      public readonly authorName: string,
      public readonly authorAvatar: string | null,
      public readonly content: string,
      public readonly images: string[],
      public readonly videos: string[],
      public readonly isPinned: boolean,
      public readonly likesCount: number,
      public readonly commentsCount: number,
      public readonly likedBy: string[], // Array of userIds who liked
      public readonly comments: Comment[],
      public readonly createdAt: Date,
      public readonly updatedAt: Date,
      public readonly lastActivityAt: Date, // For sorting by latest activity
    ) {}
  
    isAuthor(userId: string): boolean {
      return this.authorId === userId;
    }
  
    hasLikedBy(userId: string): boolean {
      return this.likedBy.includes(userId);
    }
  
    canBeEditedBy(userId: string): boolean {
      return this.isAuthor(userId);
    }
  
    canBeDeletedBy(userId: string, isEventManager: boolean, isAdmin: boolean): boolean {
      return this.isAuthor(userId) || isEventManager || isAdmin;
    }
  
    canBePinnedBy(isEventManager: boolean, isAdmin: boolean): boolean {
      return isEventManager || isAdmin;
    }
  }
  
  export class Comment {
    constructor(
      public readonly id: string,
      public readonly postId: string,
      public readonly authorId: string,
      public readonly authorName: string,
      public readonly authorAvatar: string | null,
      public readonly content: string,
      public readonly createdAt: Date,
      public readonly updatedAt: Date,
    ) {}
  
    isAuthor(userId: string): boolean {
      return this.authorId === userId;
    }
  
    canBeEditedBy(userId: string): boolean {
      return this.isAuthor(userId);
    }
  
    canBeDeletedBy(userId: string, isEventManager: boolean, isAdmin: boolean): boolean {
      return this.isAuthor(userId) || isEventManager || isAdmin;
    }
  }