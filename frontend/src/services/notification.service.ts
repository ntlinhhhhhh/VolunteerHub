// Notification Service API
const API_BASE_URL = 'http://localhost:4004'; // Notification service port

// Types matching backend
export enum NotificationType {
  USER_REGISTERED = 'user_registered',
  PASSWORD_RESET = 'password_reset',
  USER_LOCKED = 'user_locked',
  USER_UNLOCKED = 'user_unlocked',
  EVENT_CREATED = 'event_created',
  EVENT_APPROVED = 'event_approved',
  EVENT_REJECTED = 'event_rejected',
  EVENT_CANCELLED = 'event_cancelled',
  REGISTRATION_SUBMITTED = 'registration_submitted',
  REGISTRATION_ACCEPTED = 'registration_accepted',
  REGISTRATION_REJECTED = 'registration_rejected',
  REGISTRATION_COMPLETED = 'registration_completed',
  NEW_POST_ON_EVENT = 'new_post_on_event',
  NEW_COMMENT_ON_POST = 'new_comment_on_post',
  LIKE = 'like',
  POST_LIKE = 'post_liked',
  POST_UNLIKE = 'post_unliked',
  NEW_EVENT_PENDING = 'new_event_pending',
  NEW_VOLUNTEER_REGISTERED = 'new_volunteer_registered',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  FAILED = 'failed',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  channels: { inApp?: boolean; email?: string; push?: string };
  status: NotificationStatus;
  subject: string;
  content: string;
  data: Record<string, any>;
  sentAt: Date | null;
  readAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.text();
    console.error('API Error:', response.status, error);
    throw new Error(`API Error: ${response.status} ${error}`);
  }
  const data: ApiResponse<T> = await response.json();
  if (!data.success) {
    console.error('API Response Error:', data.message);
    throw new Error(data.message || 'API request failed');
  }
  return data.data!;
};

// Get notifications for a user
export const getUserNotifications = async (
  userId: string,
  limit = 20,
  channel?: NotificationChannel
): Promise<Notification[]> => {
  console.log('Fetching notifications for user:', userId);
  let url = `${API_BASE_URL}/notifications/${userId}?limit=${limit}`;
  if (channel) {
    url += `&channel=${channel}`;
  }
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<Notification[]>(response);
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  console.log('Marking notification as read:', notificationId);
  const url = `${API_BASE_URL}/notifications/${notificationId}/read`;
  console.log('PATCH:', url);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  console.log('Fetching unread notification count for user:', userId);
  const notifications = await getUserNotifications(userId, 100, NotificationChannel.IN_APP);
  return notifications.filter(n => n.status !== NotificationStatus.READ).length;
};