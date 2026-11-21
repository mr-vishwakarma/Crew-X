import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { getNavGroupsForRole } from '../routes/navigationConfig';
import { Sidebar } from '../components/navigation/Sidebar';
import { Header } from '../components/navigation/Header';
import { MobileDrawer } from '../components/navigation/MobileDrawer';
import { InspectorBottomNav } from '../components/navigation/InspectorBottomNav';
import { getPendingSyncCount } from '../database/databaseHelpers';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nirikshan_sidebar_collapsed') === 'true';
  });
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const navGroups = getNavGroupsForRole(user?.role);
  const isInspector = user?.role === 'INSPECTOR';

  // Toggle and persist desktop sidebar collapse state
  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nirikshan_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Poll or check pending sync count for Inspector bottom nav badge
  useEffect(() => {
    if (isInspector) {
      let isMounted = true;
      const updateSyncCount = async () => {
        const count = await getPendingSyncCount();
        if (isMounted) setPendingSyncCount(count);
      };
      updateSyncCount();
      const interval = setInterval(updateSyncCount, 4000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [isInspector]);

  return (
    <div className="h-screen h-[100dvh] w-full flex flex-row overflow-hidden bg-[#f4f5f6]">
      {/* Desktop Persistent Collapsible Sidebar - Strictly Fixed & Stationary */}
      <Sidebar
        groups={navGroups}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Mobile/Tablet Off-canvas Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        groups={navGroups}
      />

      {/* Right Content Area - Independently Scrollable Container */}
      <div
        id="main-content-scroll"
        className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-y-auto overflow-x-hidden relative"
      >
        <Header
          onToggleMobileDrawer={() => setMobileDrawerOpen(true)}
          title={title}
          subtitle={subtitle}
          showDbIndicator={isInspector}
        />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${
            isInspector ? 'pb-24 md:pb-8' : 'pb-8'
          }`}
        >
          {children}
        </main>

        <footer
          className={`shrink-0 border-t border-slate-200/80 bg-white py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 ${
            isInspector ? 'mb-16 md:mb-0' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4f22c] border border-black/20" />
            <span className="font-medium text-slate-600">
              Nirikshan Enterprise Platform • Version 3.4
            </span>
          </div>
          <div>© {new Date().getFullYear()} Nirikshan Inc. All rights reserved.</div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation for Inspector only */}
      {isInspector && (
        <InspectorBottomNav
          pendingSyncCount={pendingSyncCount}
          onOpenDrawer={() => setMobileDrawerOpen(true)}
        />
      )}
    </div>
  );
};
