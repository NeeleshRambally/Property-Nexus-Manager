// API configuration
const API_BASE_URL = import.meta.env.PROD
  ? 'https://rentassured-api-production.up.railway.app'
  : ''; // Use Vite proxy in development (empty string because endpoints already include /api)

// Helper to get full API URL for images and other resources
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export const apiClient = {
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  },

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  },
};
