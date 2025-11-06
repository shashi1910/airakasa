import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
}

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiClient('/api/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await apiClient('/api/auth/me');
    return response.json();
  },
};
