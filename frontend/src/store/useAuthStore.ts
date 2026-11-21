import { create } from 'zustand';
import type { User, LoginCredentials } from '../types/auth.types';
import { authService } from '../features/auth/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials: LoginCredentials): Promise<User> => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(credentials);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw err;
    }
  },

  logout: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout network error, clearing local state anyway:', err);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (_err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
