export enum ActivityType {
    EVENT_CREATED = 'event_created',
    EVENT_APPROVED = 'event_approved',
    USER_REGISTERED = 'user_registered',
    REGISTRATION_ACCEPTED = 'registration_accepted',
    POST_CREATED = 'post_created',
    COMMENT_CREATED = 'comment_created',
  }
  
  export class RecentActivity {
    constructor(
      public readonly id: string,
      public readonly type: ActivityType,
      public readonly actorId: string, // userId who performed action
      public readonly actorName: string,
      public readonly targetId: string, // eventId, postId, etc.
      public readonly targetName: string,
      public readonly description: string,
      public readonly metadata: Record<string, any>,
      public readonly timestamp: Date,
      public readonly createdAt: Date
    ) {}
  }