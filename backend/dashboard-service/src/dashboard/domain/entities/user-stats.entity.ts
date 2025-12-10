export class UserStats {
    constructor(
      public readonly id: string,
      public readonly userId: string,
      public readonly totalEventsCreated: number,
      public readonly totalEventsJoined: number,
      public readonly totalEventsCompleted: number,
      public readonly totalPostsCreated: number,
      public readonly totalCommentsCreated: number,
      public readonly lastActivityAt: Date,
      public readonly createdAt: Date,
      public readonly updatedAt: Date
    ) {}
  
    incrementEventsCreated(): UserStats {
      return new UserStats(
        this.id,
        this.userId,
        this.totalEventsCreated + 1,
        this.totalEventsJoined,
        this.totalEventsCompleted,
        this.totalPostsCreated,
        this.totalCommentsCreated,
        new Date(),
        this.createdAt,
        new Date()
      );
    }
  
    incrementEventsJoined(): UserStats {
      return new UserStats(
        this.id,
        this.userId,
        this.totalEventsCreated,
        this.totalEventsJoined + 1,
        this.totalEventsCompleted,
        this.totalPostsCreated,
        this.totalCommentsCreated,
        new Date(),
        this.createdAt,
        new Date()
      );
    }
  }