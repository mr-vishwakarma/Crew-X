import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import type { NavGroup } from '../../routes/navigationConfig';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface SidebarProps {
  groups: NavGroup[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ groups, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#12141a] text-slate-300 border-r border-[#1e222d] transition-all duration-300 ease-in-out shrink-0 select-none z-30 sticky top-0 h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e222d]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-black shadow-md ring-1 ring-amber-500/30 flex items-center justify-center p-0.5 shrink-0">
            <img src="/logo.jpg" alt="Nirikshan Logo" className="h-full w-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-extrabold text-sm tracking-tight text-white truncate flex items-center gap-1.5">
                NIRIKSHAN
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4f22c]" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                Inspect Smarter. Operate Better.
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Context Pill */}
      {!isCollapsed && user && (
        <div className="px-4 py-2.5 bg-[#161922] border-b border-[#1e222d] flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold text-white truncate">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.organizationId}</p>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#d4f22c] text-[#12141a] uppercase tracking-wider">
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation List with Categorized Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {group.groupName}
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? 'bg-white/10 text-white shadow-2xs font-bold border-l-3 border-[#d4f22c]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}

                  {!isCollapsed && item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d4f22c] text-[#12141a]">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#181b24] text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                      {item.label}
                      {item.badge !== undefined && (
                        <span className="ml-1.5 px-1 py-0.2 bg-[#d4f22c] text-[#12141a] rounded text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer with Logout */}
      <div className="p-3 border-t border-[#1e222d] bg-[#12141a]">
        <button
          type="button"
          onClick={() => logout()}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
