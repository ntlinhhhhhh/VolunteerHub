// Registration Service API
const API_BASE_URL = 'http://localhost:4008'; // Event registration service port

// Types matching backend - Export for use in components
export interface BackendRegistration {
  id: string;
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  registrationDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  checkInDate?: string;
  checkOutDate?: string;
  completedDate?: string;
  notes?: string;
  ratings?: {
    volunteerRating?: number;
    volunteerFeedback?: string;
    organizerRating?: number;
    organizerFeedback?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistrationDto {
  eventId: string;
  notes?: string;
  skills?: string[];
  availability?: string;
  motivation?: string;
}

export interface RegistrationResponse {
  success: boolean;
  data?: BackendRegistration;
  message?: string;
}

export interface CheckInResponse {
  success: boolean;
  data?: BackendRegistration;
  message?: string;
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

// Apply for an event
export const applyForEvent = async (registrationData: CreateRegistrationDto): Promise<BackendRegistration> => {
  console.log('Applying for event:', registrationData.eventId);

  const url = `${API_BASE_URL}/registrations/apply`;
  console.log('POST:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(registrationData),
  });

  return handleResponse<BackendRegistration>(response);
};

// Check-in using QR code or manual entry
export const checkInByCode = async (code: string): Promise<BackendRegistration> => {
  console.log('Checking in with code:', code);

  const url = `${API_BASE_URL}/registrations/check-in-by-code`;
  console.log('POST:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });

  return handleResponse<BackendRegistration>(response);
};

// Get user's registration for a specific event
export const getMyRegistrationForEvent = async (eventId: string): Promise<BackendRegistration | null> => {
  console.log('Getting my registration for event:', eventId);

  // This would need a custom endpoint or we can filter from my-registrations
  // For now, we'll use my-registrations and filter by eventId
  const url = `${API_BASE_URL}/registrations/my-registrations?eventId=${eventId}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  const result = await handleResponse<{ data: BackendRegistration[], pagination: any }>(response);
  return result.data.length > 0 ? result.data[0] : null;
};

// Cancel registration
export const cancelRegistration = async (registrationId: string, reason?: string): Promise<BackendRegistration> => {
  console.log('Cancelling registration:', registrationId);

  const url = `${API_BASE_URL}/registrations/${registrationId}/cancel`;
  console.log('DELETE:', url);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });

  return handleResponse<BackendRegistration>(response);
};

// Confirm attendance (for approved volunteers)
export const confirmAttendance = async (registrationId: string): Promise<BackendRegistration> => {
  console.log('Confirming attendance for registration:', registrationId);

  const url = `${API_BASE_URL}/registrations/${registrationId}/confirm`;
  console.log('PUT:', url);

  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendRegistration>(response);
};