/**
 * EVENT STATUS LIFECYCLE
 * 
 * DRAFT → User tạo event nhưng chưa submit
 * PENDING_APPROVAL → User submit, đợi admin duyệt
 * APPROVED → Admin đã approve
 * PUBLISHED → Event đã publish công khai (sau khi approve)
 * ONGOING → Event đang diễn ra
 * COMPLETED → Event đã hoàn thành
 * CANCELLED → Event bị hủy do user tự hủy
 * REJECTED → Admin từ chối (cần chỉnh sửa)
 */

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