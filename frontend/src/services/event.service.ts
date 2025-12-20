// Event Service API
const API_BASE_URL = 'http://localhost:4006'; // Event service port

// Types matching backend - Export for use in components
export interface BackendEvent {
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

export interface BackendCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  success: boolean;
  data: BackendEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: BackendCategory[];
  total: number;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  // TODO: Get from auth context or localStorage
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

// Fetch events with filtering
export const getEvents = async (
  filters: {
    search?: string;
    categoryId?: string;
    city?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'startDate' | 'title' | 'currentVolunteers';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<EventsResponse> => {
  console.log('Fetching events with filters:', filters);

  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.city) params.append('city', filters.city);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const url = `${API_BASE_URL}/events?${params.toString()}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<EventsResponse>(response);
};

// Fetch all categories
export const getCategories = async (): Promise<BackendCategory[]> => {
  console.log('Fetching categories');

  const url = `${API_BASE_URL}/../categories`; // Assuming categories are on the same service
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await handleResponse<CategoriesResponse>(response);
  return result.data;
};

// Fetch single event by ID
export const getEventById = async (eventId: string): Promise<BackendEvent> => {
  console.log('Fetching event by ID:', eventId);

  const url = `${API_BASE_URL}/events/${eventId}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendEvent>(response);
};

// Fetch event by slug
export const getEventBySlug = async (slug: string): Promise<BackendEvent> => {
  console.log('Fetching event by slug:', slug);

  const url = `${API_BASE_URL}/events/slug/${slug}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendEvent>(response);
};