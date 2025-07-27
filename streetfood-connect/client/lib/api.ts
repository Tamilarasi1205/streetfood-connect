// API utility for handling environment-based URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};

export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// Helper for authenticated requests
export const authenticatedApiCall = (token: string, endpoint: string, options?: RequestInit) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
};
