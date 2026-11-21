import React from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShieldCheck, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">Nirikshan</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Phase 1
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              Field Inspection & Compliance Platform
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900 leading-tight">
                {user.fullName}
              </span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>

            <Badge role={user.role} />

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              isLoading={isLoading}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="text-slate-700 hover:text-red-700 hover:border-red-200 hover:bg-red-50"
            >
              Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
