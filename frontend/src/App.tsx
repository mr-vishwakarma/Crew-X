import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './features/auth/hooks/useAuth';
import { NetworkBanner } from './components/common/NetworkBanner';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import { PwaUpdatePrompt } from './components/pwa/PwaUpdatePrompt';

export const App: React.FC = () => {
  const { checkAuth } = useAuth();

  // On initial mount, verify session cookie with backend or restore offline session
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <NetworkBanner />
      <AppRoutes />
      <PwaInstallPrompt />
      <PwaUpdatePrompt />
    </BrowserRouter>
  );
};

export default App;
