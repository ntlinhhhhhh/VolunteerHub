export enum NotificationChannel {
    EMAIL = 'email',
    IN_APP = 'in_app',
}

export interface NotificationChannels {
    inApp?: boolean;
    email?: string;
    push?: string; // token or id 
}