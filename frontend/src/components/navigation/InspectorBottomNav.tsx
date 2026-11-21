import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, FileCheck2, RefreshCw, Menu } from 'lucide-react';

interface InspectorBottomNavProps {
  onOpenDrawer: () => void;
  pendingSyncCount?: number;
}

export const InspectorBottomNav: React.FC<InspectorBottomNavProps> = ({
  onOpenDrawer,
  pendingSyncCount = 0,
}) => {
  const navTabs = [
    { label: 'Home', path: '/inspector/dashboard', icon: Home },
    { label: 'Inspections', path: '/inspector/inspections', icon: ClipboardList },
    { label: 'Checklist', path: '/inspector/checklist', icon: FileCheck2 },
    {
      label: 'Sync',
      path: '/inspector/sync',
      icon: RefreshCw,
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 safe-bottom select-none">
      <div className="grid grid-cols-5 items-center">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-colors relative ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-bold shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="truncate mt-1">{tab.label}</span>
            </NavLink>
          );
        })}

        {/* More actions trigger drawer */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="truncate mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
};
