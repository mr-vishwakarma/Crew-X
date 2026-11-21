import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './features/auth/hooks/useAuth';

export const App: React.FC = () => {
  const { checkAuth } = useAuth();

  // On initial mount, verify session cookie with backend
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
