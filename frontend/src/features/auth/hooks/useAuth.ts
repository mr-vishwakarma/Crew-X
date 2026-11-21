import { useAuthStore } from '../../../store/useAuthStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, isInitialized, error, login, logout, checkAuth, clearError } =
    useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    checkAuth,
    clearError,
  };
};
