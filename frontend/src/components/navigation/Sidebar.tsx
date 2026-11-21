import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import type { NavItem } from '../../routes/navigationConfig';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  items: NavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`hidden md:flex flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0 select-none z-30 sticky top-0 h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-extrabold text-base tracking-tight text-white truncate">
                Nirikshan
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                Inspect Smarter. Operate Better.
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed && user && (
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              {user.fullName}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user.organizationId}</p>
          </div>
          <Badge role={user.role} size="sm" />
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />

              {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}

              {!isCollapsed && item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-blue-400 border border-slate-700">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                  {item.label}
                  {item.badge !== undefined && (
                    <span className="ml-1.5 px-1 py-0.2 bg-blue-600 rounded text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          type="button"
          onClick={() => logout()}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
