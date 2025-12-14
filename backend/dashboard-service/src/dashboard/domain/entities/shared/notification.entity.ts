export interface NotificationItem {
    id: string;
    userId: string;
    type: 'EVENT_REMINDER' | 'REGISTRATION_UPDATE' | 'EVENT_CANCELLED' | 'ACHIEVEMENT' | 'BADGE_EARNED' | 'MESSAGE' | 'SYSTEM';
    title: string;
    message: string;
    read: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actionUrl?: string;
    createdAt: Date;
}

export interface PendingAction {
    id: string;
    type: 'APPROVAL_NEEDED' | 'CHECK_IN_PENDING' | 'FEEDBACK_NEEDED' | 'EVENT_PUBLISH' | 'LOW_REGISTRATION';
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    eventId?: string;
    volunteerId?: string;
    dueDate?: Date;
    actionUrl: string;
}
