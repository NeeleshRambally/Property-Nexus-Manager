// API configuration
const API_BASE_URL = import.meta.env.PROD
  ? 'https://rentassured-api-production.up.railway.app'
  : ''; // Use Vite proxy in development (empty string because endpoints already include /api)

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
};
