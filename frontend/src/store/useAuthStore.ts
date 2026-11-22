import { create } from 'zustand';
import type { User, LoginCredentials } from '../types/auth.types';
import { authService } from '../features/auth/services/auth.service';
import { getPendingSyncCount } from '../database/databaseHelpers';

const OFFLINE_SESSION_KEY = 'nirikshan_offline_session';
const OFFLINE_SESSION_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours valid offline window

interface CachedOfflineSession {
  user: User;
  cachedAt: number;
  expiresAt: number;
}

const saveOfflineSession = (user: User) => {
  try {
    const session: CachedOfflineSession = {
      user,
      cachedAt: Date.now(),
      expiresAt: Date.now() + OFFLINE_SESSION_TTL_MS,
    };
    localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('[AuthStore] Failed to cache offline session:', err);
  }
};

const getOfflineSession = (): User | null => {
  try {
    const raw = localStorage.getItem(OFFLINE_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as CachedOfflineSession;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(OFFLINE_SESSION_KEY);
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
};

const clearOfflineSession = () => {
  localStorage.removeItem(OFFLINE_SESSION_KEY);
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isOfflineAuthenticated: boolean;
  error: string | null;
  pendingUnsyncedAlert: boolean;

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
  isOfflineAuthenticated: false,
  error: null,
  pendingUnsyncedAlert: false,

  login: async (credentials: LoginCredentials): Promise<User> => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(credentials);
      saveOfflineSession(user);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isOfflineAuthenticated: false,
        error: null,
      });
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isOfflineAuthenticated: false,
        error: message,
      });
      throw err;
    }
  },

  logout: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      // Check if there are unsynced records before logging out
      const pendingCount = await getPendingSyncCount();
      if (pendingCount > 0) {
        console.warn(
          `[AuthStore] Logging out with ${pendingCount} pending local inspection records in Dexie.js. Records remain safely in IndexedDB.`
        );
      }
      await authService.logout();
    } catch (err) {
      console.warn('Logout network error, clearing local state anyway:', err);
    } finally {
      clearOfflineSession();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isOfflineAuthenticated: false,
        error: null,
      });
    }
  },

  checkAuth: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      // Attempt online verification with backend
      const user = await authService.getMe();
      saveOfflineSession(user);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        isOfflineAuthenticated: false,
        error: null,
      });
    } catch (err: any) {
      // When offline or server unreachable, check if an offline session entitlement exists
      const isNetworkIssue =
        (typeof navigator !== 'undefined' && !navigator.onLine) ||
        err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('Failed to fetch');

      const cachedUser = getOfflineSession();
      const hasToken =
        localStorage.getItem('nirikshan_token') || sessionStorage.getItem('nirikshan_token');

      if (isNetworkIssue && hasToken && cachedUser) {
        console.log(
          `[AuthStore] Offline mode active for user ${cachedUser.fullName} (${cachedUser.role}). Session restored from offline entitlement.`
        );
        set({
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          isOfflineAuthenticated: true,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          isOfflineAuthenticated: false,
          error: null,
        });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
