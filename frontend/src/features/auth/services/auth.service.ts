import { apiClient } from '../../../services/api';
import type { AuthResponse, LoginCredentials, User } from '../../../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token?: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    if (!response.data.success || !response.data.data?.user) {
      throw new Error(response.data.message || 'Authentication failed');
    }

    if (response.data.data.token) {
      if (credentials.rememberMe) {
        localStorage.setItem('nirikshan_token', response.data.data.token);
      } else {
        sessionStorage.setItem('nirikshan_token', response.data.data.token);
      }
    }

    return {
      user: response.data.data.user,
      token: response.data.data.token,
    };
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<AuthResponse>('/auth/me');

    if (!response.data.success || !response.data.data?.user) {
      throw new Error(response.data.message || 'Session not found');
    }

    return response.data.data.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('nirikshan_token');
      sessionStorage.removeItem('nirikshan_token');
    }
  },
};
