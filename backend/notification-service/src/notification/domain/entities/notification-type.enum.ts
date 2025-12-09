export enum NotificationType {
    // Auth events
    USER_REGISTERED = 'user_registered',
    PASSWORD_RESET = 'password_reset',
    USER_LOCKED = 'user_locked',
    USER_UNLOCKED = 'user_unlocked',

    // Event events
    EVENT_CREATED = 'event_created',
    EVENT_APPROVED = 'event_approved',
    EVENT_REJECTED = 'event_rejected',
    EVENT_CANCELLED = 'event_cancelled',

    // Registration events
    REGISTRATION_SUBMITTED = 'registration_submitted',
    REGISTRATION_ACCEPTED = 'registration_accepted',
    REGISTRATION_REJECTED = 'registration_rejected',
    REGISTRATION_COMPLETED = 'registration_completed',

    // Communication events
    NEW_POST_ON_EVENT = 'new_post_on_event',
    NEW_COMMENT_ON_POST = 'new_comment_on_post',

    // Admin alerts
    NEW_EVENT_PENDING = 'new_event_pending',
    NEW_VOLUNTEER_REGISTERED = 'new_volunteer_registered',
}