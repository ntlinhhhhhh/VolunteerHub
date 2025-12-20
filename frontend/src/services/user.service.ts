// User Service API
const API_BASE_URL = 'http://localhost:8000';

// Types for user profile
export interface UserProfile {
  id: string;
  authId: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  bio: string;
  avatar: string;
  dateOfBirth: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
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

// Get current user profile
export const getMyProfile = async (): Promise<UserProfile> => {
  console.log('Fetching user profile');
  const url = `${API_BASE_URL}/users/me`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<UserProfile>(response);
};

// Update current user profile
export const updateMyProfile = async (updateData: UpdateUserProfileDto): Promise<UserProfile> => {
  console.log('Updating user profile', updateData);
  const url = `${API_BASE_URL}/users/me`;
  console.log('PUT:', url);

  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  return handleResponse<UserProfile>(response);
};