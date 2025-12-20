// Event Registration Service API
const API_BASE_URL = 'http://localhost:4010'; // Assuming direct access, adjust if through Kong

// Types matching backend
export interface BackendRegistration {
  id: string;
  registrationCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  roleId: string;
  roleName: string;
  status: string;
  applicationForm: any;
  approval: any;
  attendance: any;
  completion: any;
  createdAt: string;
  updatedAt: string;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: any;
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

// Get volunteer's registrations
export const getMyRegistrations = async (): Promise<BackendRegistration[]> => {
  console.log('Fetching my registrations');
  const url = `${API_BASE_URL}/registrations/my-registrations?limit=1000`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await handleResponse<{ data: BackendRegistration[]; pagination: any }>(response);
  return result.data;
};

// Get event participants (accepted/confirmed registrations)
export const getEventParticipants = async (eventId: string): Promise<BackendRegistration[]> => {
  console.log('Fetching participants for event:', eventId);
  const url = `${API_BASE_URL}/registrations?eventId=${eventId}&status=accepted&status=confirmed&status=checked_in&status=completed&limit=1000`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await handleResponse<{ data: BackendRegistration[]; pagination: any }>(response);
  return result.data;
};