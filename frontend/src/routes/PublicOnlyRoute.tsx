import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LoadingScreen } from '../components/common/LoadingScreen';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen message="Loading Nirikshan..." />;
  }

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'SUPERVISOR') {
      return <Navigate to="/supervisor/dashboard" replace />;
    }
    return <Navigate to="/inspector/dashboard" replace />;
  }

  return <>{children}</>;
};
