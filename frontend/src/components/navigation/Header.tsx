import React, { useState } from 'react';
import { Menu, Search, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { NotificationDropdown } from './NotificationDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';

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
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global Ctrl+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 shrink-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Trigger & Context Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {title ? (
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 hidden sm:block leading-none mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-900">
              Welcome back, <span className="text-[#12141a]">{user?.fullName || 'User'}</span>
            </div>
          )}
        </div>

        {/* Center: Global Search Pill */}
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-4">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="w-full h-9 px-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/70 text-slate-400 hover:text-slate-600 flex items-center justify-between text-xs transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search projects, sites, personnel...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Connectivity + Notifications + User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden h-9 w-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Connection Status */}
          <ConnectionStatus showDbStatus={showDbIndicator} />

          {/* Real-time Notifications */}
          <NotificationDropdown />

          {/* User Profile Pill */}
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer select-none"
                aria-expanded={profileOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-[#12141a] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500">{user.role}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Signed In As
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="pt-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#d4f22c] text-[#12141a]">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 border-b border-slate-100 text-xs text-slate-500 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-medium text-slate-700">Org:</span>
                        <span className="font-mono text-[11px] truncate">{user.organizationId}</span>
                      </div>
                    </div>

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Platform</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Global Search Command Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};
