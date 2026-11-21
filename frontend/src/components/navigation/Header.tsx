import React, { useState } from 'react';
import { Menu, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Badge } from '../ui/Badge';
import { ConnectionStatus } from '../ui/ConnectionStatus';

interface HeaderProps {
  onToggleMobileDrawer: () => void;
  title?: string;
  subtitle?: string;
  showDbIndicator?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileDrawer,
  title,
  subtitle,
  showDbIndicator = false,
}) => {
  const { user, logout, isLoading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Drawer Trigger + Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block leading-none mt-0.5">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Live Connectivity + Profile Pill + Sign Out */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Reactive Connection Status */}
        <ConnectionStatus showDbStatus={showDbIndicator} />

        {/* User Profile Pill & Dropdown */}
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none"
              aria-expanded={profileOpen}
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-slate-500">{user.email}</span>
              </div>
              <Badge role={user.role} size="sm" className="hidden lg:inline-flex" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Signed In As
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="pt-2">
                      <Badge role={user.role} size="sm" />
                    </div>
                  </div>

                  <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-medium text-slate-700">Organization:</span>
                      <span className="font-mono text-[11px] truncate">{user.organizationId}</span>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      disabled={isLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
