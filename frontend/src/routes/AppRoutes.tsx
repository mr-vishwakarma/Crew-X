import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { SupervisorDashboardPage } from '../pages/supervisor/SupervisorDashboardPage';
import { InspectorDashboardPage } from '../pages/inspector/InspectorDashboardPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoadingScreen } from '../components/common/LoadingScreen';

// Helper component for the root path '/'
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen message="Connecting to Nirikshan..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user.role === 'SUPERVISOR') {
    return <Navigate to="/supervisor/dashboard" replace />;
  }
  return <Navigate to="/inspector/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Login Route (redirects to dashboard if already authenticated) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* Role-Protected Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Supervisor Dashboard */}
      <Route
        path="/supervisor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <SupervisorDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Inspector Dashboard */}
      <Route
        path="/inspector/dashboard"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <InspectorDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized 403 Page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 404 Not Found Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
