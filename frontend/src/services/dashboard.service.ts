// Dashboard Service API - Aggregates data from multiple services
const REGISTRATION_API_BASE_URL = 'http://localhost:4008'; // Event registration service
const EVENT_API_BASE_URL = 'http://localhost:4006'; // Event service
const USER_API_BASE_URL = 'http://localhost:8000'; // User service via Kong
const FEEDBACK_API_BASE_URL = 'http://localhost:8000'; // Feedback service via Kong

// Types for dashboard data
export interface UserStats {
  totalEventsParticipated: number;
  totalHoursContributed: number;
  averageRating: number;
  totalRegistrations: number;
  completedEvents: number;
  upcomingEvents: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'registered' | 'approved' | 'organizing';
  image: string;
  organizerName?: string;
}

export interface RecentActivity {
  id: string;
  type: 'registration' | 'checkin' | 'completion' | 'feedback' | 'organization';
  title: string;
  description: string;
  date: string;
  eventId?: string;
  eventTitle?: string;
}

export interface FeedbackItem {
  id: string;
  eventName: string;
  organizer?: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  type: 'received' | 'given';
}

export interface DashboardData {
  userStats: UserStats;
  upcomingEvents: UpcomingEvent[];
  recentActivities: RecentActivity[];
  notifications: any[]; // TODO: Define notification type
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const userId = localStorage.getItem('userId') || 'mock-user-id';
  const userName = localStorage.getItem('userName') || 'Mock User';
  const userAvatar = localStorage.getItem('userAvatar') || null;
  const userRole = localStorage.getItem('userRole') || 'volunteer';
  const userEmail = localStorage.getItem('userEmail') || 'mock@example.com';
  const userPhone = localStorage.getItem('userPhone') || '0123456789';

  return {
    'x-user-id': userId,
    'x-user-name': userName,
    'x-user-avatar': userAvatar || '',
    'x-user-role': userRole,
    'x-user-email': userEmail,
    'x-user-phone': userPhone,
    'Content-Type': 'application/json',
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

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
  console.log('Fetching user statistics');

  try {
    const url = `${REGISTRATION_API_BASE_URL}/registrations/my-statistics`;
    console.log('GET:', url);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const stats = await handleResponse<any>(response);

    // Transform the backend stats to our format
    return {
      totalEventsParticipated: stats.totalEventsParticipated || 0,
      totalHoursContributed: stats.totalHoursContributed || 0,
      averageRating: stats.averageRating || 0,
      totalRegistrations: stats.totalRegistrations || 0,
      completedEvents: stats.completedEvents || 0,
      upcomingEvents: stats.upcomingEvents || 0,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return default stats if API fails
    return {
      totalEventsParticipated: 0,
      totalHoursContributed: 0,
      averageRating: 0,
      totalRegistrations: 0,
      completedEvents: 0,
      upcomingEvents: 0,
    };
  }
};

// Get upcoming events for the user
export const getUpcomingEvents = async (limit = 5): Promise<UpcomingEvent[]> => {
  console.log('Fetching upcoming events');

  try {
    const url = `${REGISTRATION_API_BASE_URL}/registrations/my-registrations?status=approved&upcoming=true&limit=${limit}`;
    console.log('GET:', url);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse<{ data: any[], pagination: any }>(response);

    // Transform registrations to upcoming events
    return result.data.map(reg => ({
      id: reg.eventId,
      title: reg.eventTitle || 'Unknown Event',
      date: reg.eventDate ? new Date(reg.eventDate).toLocaleDateString('vi-VN') : 'TBD',
      time: reg.eventTime || 'TBD',
      location: reg.eventLocation || 'TBD',
      status: 'approved' as const,
      image: reg.eventImage || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      organizerName: reg.organizerName,
    }));
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};

// Get recent activities
export const getRecentActivities = async (limit = 10): Promise<RecentActivity[]> => {
  console.log('Fetching recent activities');

  try {
    // For now, we'll create mock activities based on registrations
    // In a real implementation, this would come from a dedicated activity log service
    const url = `${REGISTRATION_API_BASE_URL}/registrations/my-registrations?limit=${limit}&sortBy=createdAt&sortOrder=desc`;
    console.log('GET:', url);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse<{ data: any[], pagination: any }>(response);

    // Transform registrations to activities
    return result.data.map(reg => ({
      id: reg.id,
      type: reg.status === 'completed' ? 'completion' : 'registration' as any,
      title: reg.status === 'completed' ? 'Hoàn thành sự kiện' : 'Đăng ký sự kiện',
      description: reg.eventTitle || 'Unknown Event',
      date: new Date(reg.createdAt).toLocaleDateString('vi-VN'),
      eventId: reg.eventId,
      eventTitle: reg.eventTitle,
    }));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

// Get feedback (received and given)
export const getFeedback = async (type: 'received' | 'given' = 'received', limit = 10): Promise<FeedbackItem[]> => {
  console.log(`Fetching ${type} feedback`);

  try {
    const userId = localStorage.getItem('userId') || 'mock-user-id';
    const endpoint = type === 'received' ? 'received' : 'given';
    const url = `${FEEDBACK_API_BASE_URL}/feedback/volunteer/${userId}/${endpoint}?limit=${limit}`;
    console.log('GET:', url);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse<{ data: any[], pagination: any }>(response);

    // Transform the backend feedback to our format
    return result.data.map((fb: any) => ({
      id: fb.id,
      eventName: fb.eventTitle || 'Unknown Event',
      organizer: fb.organizerName || 'Ban tổ chức',
      avatar: fb.organizerAvatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80",
      rating: fb.rating,
      comment: fb.comment,
      date: new Date(fb.createdAt).toLocaleDateString('vi-VN'),
      type: type
    }));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
};

// Get complete dashboard data
export const getVolunteerDashboard = async (): Promise<DashboardData> => {
  console.log('Fetching complete volunteer dashboard data');

  try {
    const [userStats, upcomingEvents, recentActivities] = await Promise.all([
      getUserStats(),
      getUpcomingEvents(),
      getRecentActivities(),
    ]);

    return {
      userStats,
      upcomingEvents,
      recentActivities,
      notifications: [], // TODO: Implement notifications
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default data
    return {
      userStats: {
        totalEventsParticipated: 0,
        totalHoursContributed: 0,
        averageRating: 0,
        totalRegistrations: 0,
        completedEvents: 0,
        upcomingEvents: 0,
      },
      upcomingEvents: [],
      recentActivities: [],
      notifications: [],
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  console.log('Marking notification as read:', notificationId);

  // TODO: Implement when notification service is available
  console.log('Notification service not implemented yet');
};