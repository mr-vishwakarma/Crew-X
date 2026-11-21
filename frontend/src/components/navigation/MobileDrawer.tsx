import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import type { NavGroup } from '../../routes/navigationConfig';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: NavGroup[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, groups }) => {
  const { user, logout } = useAuth();

  // Close on Escape key and freeze background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#12141a] text-slate-300 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e222d]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-black shadow-md ring-1 ring-amber-500/30 flex items-center justify-center p-0.5">
              <img src="/logo.jpg" alt="Nirikshan" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                NIRIKSHAN
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Field Inspection & Compliance
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role info */}
        {user && (
          <div className="px-4 py-2.5 bg-[#161922] border-b border-[#1e222d] flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.organizationId}</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#d4f22c] text-[#12141a]">
              {user.role}
            </span>
          </div>
        )}

        {/* Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {groups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {group.groupName}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-white/10 text-white font-bold border-l-3 border-[#d4f22c]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d4f22c] text-[#12141a]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-[#1e222d] bg-[#12141a]">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
