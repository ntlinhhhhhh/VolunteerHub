export enum ActivityType {
    EVENT_REGISTERED = 'EVENT_REGISTERED',
    EVENT_COMPLETED = 'EVENT_COMPLETED',
    BADGE_EARNED = 'BADGE_EARNED',
    LEVEL_UP = 'LEVEL_UP',
    CHECK_IN = 'CHECK_IN',
    CHECK_OUT = 'CHECK_OUT',
    FEEDBACK_GIVEN = 'FEEDBACK_GIVEN',
    EVENT_CREATED = 'EVENT_CREATED',
    EVENT_PUBLISHED = 'EVENT_PUBLISHED',
    VOLUNTEER_APPROVED = 'VOLUNTEER_APPROVED'
}

export interface Activity {
    id: string;
    type: ActivityType;
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    actorRole?: string;
    targetId: string;
    targetName: string;
    targetType: 'EVENT' | 'USER' | 'POST' | 'COMMENT';
    description: string;
    metadata: Record<string, any>;
    timestamp: Date;
}
