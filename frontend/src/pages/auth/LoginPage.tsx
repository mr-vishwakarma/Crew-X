import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSuccess = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user?.role === 'SUPERVISOR') {
      navigate('/supervisor/dashboard', { replace: true });
    } else {
      navigate('/inspector/dashboard', { replace: true });
    }
  };

  return (
    <AuthLayout>
      <LoginForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
};
