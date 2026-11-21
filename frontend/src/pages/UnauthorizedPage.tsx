import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user?.role === 'SUPERVISOR') {
      navigate('/supervisor/dashboard', { replace: true });
    } else {
      navigate('/inspector/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Access Denied (403)</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Your authenticated role (
            <span className="font-semibold text-slate-800">{user?.role || 'Guest'}</span>) does
            not possess authorization to view this resource.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 text-left space-y-1">
          <p className="font-semibold text-slate-700">Role-Based Access Enforcement:</p>
          <p>Strict role segregation is required to maintain compliance and audit integrity.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleReturnToDashboard}
          >
            My Dashboard
          </Button>
          <Button
            variant="outline"
            size="md"
            className="flex-1 hover:text-red-700 hover:border-red-200 hover:bg-red-50"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={() => logout()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
