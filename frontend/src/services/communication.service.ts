// Communication Service API
const API_BASE_URL = 'http://localhost:4010'; // Assuming direct access, adjust if through Kong

// Types matching backend - Export for use in components
export interface BackendPost {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  images: string[];
  videos: string[];
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  likedBy: string[];
  comments: BackendComment[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface BackendComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
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

// Get posts for an event
export const getPosts = async (eventId: string, limit = 20, skip = 0, sortBy: 'latest' | 'most_active' = 'latest'): Promise<BackendPost[]> => {
  console.log('Fetching posts for event:', eventId);
  const url = `${API_BASE_URL}/events/${eventId}/posts?limit=${limit}&skip=${skip}&sortBy=${sortBy}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendPost[]>(response);
};

// Create a new post
export const createPost = async (eventId: string, content: string, images: string[] = []): Promise<BackendPost> => {
  console.log('Creating post for event:', eventId, content);
  const url = `${API_BASE_URL}/events/${eventId}/posts`;
  console.log('POST:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content,
      images,
      videos: [], // Not implemented in frontend yet
    }),
  });

  return handleResponse<BackendPost>(response);
};

// Like a post
export const likePost = async (eventId: string, postId: string): Promise<void> => {
  console.log('Liking post:', postId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}/like`;
  console.log('POST:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

// Unlike a post
export const unlikePost = async (eventId: string, postId: string): Promise<void> => {
  console.log('Unliking post:', postId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}/like`;
  console.log('DELETE:', url);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

// Get post by ID
export const getPostById = async (eventId: string, postId: string): Promise<BackendPost> => {
  console.log('Fetching post by ID:', postId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}`;
  console.log('GET:', url);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleResponse<BackendPost>(response);
};

// Update a post
export const updatePost = async (eventId: string, postId: string, content: string, images: string[] = [], videos: string[] = []): Promise<BackendPost> => {
  console.log('Updating post:', postId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}`;
  console.log('PUT:', url);

  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content,
      images,
      videos,
    }),
  });

  return handleResponse<BackendPost>(response);
};

// Delete a post
export const deletePost = async (eventId: string, postId: string): Promise<void> => {
  console.log('Deleting post:', postId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}`;
  console.log('DELETE:', url);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('API Error:', response.status, error);
    throw new Error(`API Error: ${response.status} ${error}`);
  }
  // DELETE returns 204 No Content, so no body to parse
};

// Pin a post (Event Manager / Admin only)
export const pinPost = async (eventId: string, postId: string): Promise<void> => {
  console.log('Pinning post:', postId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}/pin`;
  console.log('PATCH:', url);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

// Unpin a post (Event Manager / Admin only)
export const unpinPost = async (eventId: string, postId: string): Promise<void> => {
  console.log('Unpinning post:', postId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}/unpin`;
  console.log('PATCH:', url);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
};

// Add comment to post
export const addComment = async (eventId: string, postId: string, content: string): Promise<BackendComment> => {
  console.log('Adding comment to post:', postId, content);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}/comments`;
  console.log('POST:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content,
    }),
  });

  return handleResponse<BackendComment>(response);
};

// Update a comment
export const updateComment = async (eventId: string, postId: string, commentId: string, content: string): Promise<void> => {
  console.log('Updating comment:', commentId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}/comments/${commentId}`;
  console.log('PUT:', url);

  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('API Error:', response.status, error);
    throw new Error(`API Error: ${response.status} ${error}`);
  }
  // PUT returns 200 with success message, but we don't need the data
};

// Delete a comment
export const deleteComment = async (eventId: string, postId: string, commentId: string): Promise<void> => {
  console.log('Deleting comment:', commentId);
  const url = `${API_BASE_URL}/events/${eventId}/posts/${postId}/comments/${commentId}`;
  console.log('DELETE:', url);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('API Error:', response.status, error);
    throw new Error(`API Error: ${response.status} ${error}`);
  }
  // DELETE returns 204 No Content
};