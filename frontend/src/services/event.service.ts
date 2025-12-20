// Event Service API
const API_BASE_URL = 'http://localhost:4010'; // Assuming direct access, adjust if through Kong

// Types matching backend
export interface BackendEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  status: string;
  imageUrl?: string;
  requirements: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Full backend event type for detailed operations
export interface FullBackendEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  categoryId: string;
  categoryName: string;
  location: {
    address: string;
    city: string;
    district: string;
    ward?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  schedule: {
    startDate: string;
    endDate: string;
    registrationDeadline: string;
  };
  requirements: {
    minAge?: number;
    maxAge?: number;
    skills: string[];
    experience?: string;
    healthRequirements?: string;
  };
  capacity: {
    maxVolunteers: number;
    currentVolunteers: number;
    minVolunteers: number;
  };
  roles: Array<{
    id: string;
    name: string;
    description: string;
    slots: number;
    filled: number;
  }>;
  status: string;
  approval: {
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    reviewedAt?: string;
  };
  media: {
    images: string[];
    videos: string[];
    documents: string[];
  };
  visibility: 'public' | 'private';
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Additional types for other files (to avoid breaking them)
export interface BackendCategory {
  id: string;
  name: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

  return {
    'x-user-id': userId,
    'x-user-name': userName,
    'x-user-avatar': userAvatar || '',
    'x-user-role': userRole,
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

// Get events with filters
export const getEvents = async (filters?: any) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE_URL}/events?${params.toString()}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<{ data: BackendEvent[]; pagination: any }>(response);
};

// Get categories
export const getCategories = async (): Promise<BackendCategory[]> => {
  const url = `${API_BASE_URL}/categories`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await handleResponse<{ data: BackendCategory[] }>(response);
  return result.data;
};

// Get event by ID
export const getEventById = async (eventId: string): Promise<FullBackendEvent> => {
  console.log('Fetching event by ID:', eventId);
  const url = `${API_BASE_URL}/events/${eventId}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<FullBackendEvent>(response);
};