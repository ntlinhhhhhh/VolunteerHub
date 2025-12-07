export enum EventStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    PUBLISHED = 'published',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REJECTED = 'rejected',
}

export const EVENT_STATUS_TRANSITIONS = {
    [EventStatus.DRAFT]: [EventStatus.PENDING_APPROVAL, EventStatus.CANCELLED],
    [EventStatus.PENDING_APPROVAL]: [EventStatus.APPROVED, EventStatus.REJECTED],
    [EventStatus.APPROVED]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
    [EventStatus.REJECTED]: [EventStatus.PENDING_APPROVAL, EventStatus.CANCELLED],
    [EventStatus.PUBLISHED]: [EventStatus.ONGOING, EventStatus.CANCELLED],
    [EventStatus.ONGOING]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
    [EventStatus.COMPLETED]: [],
    [EventStatus.CANCELLED]: [],
};