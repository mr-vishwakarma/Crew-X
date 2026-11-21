import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { getNavItemsForRole } from '../routes/navigationConfig';
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

  const navItems = getNavItemsForRole(user?.role);
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
    <div className="min-h-screen bg-slate-50 flex flex-row w-full overflow-x-hidden">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        items={navItems}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Mobile/Tablet Off-canvas Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        items={navItems}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileDrawer={() => setMobileDrawerOpen(true)}
          title={title}
          subtitle={subtitle}
          showDbIndicator={isInspector}
        />

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${
          isInspector ? 'pb-24 md:pb-8' : 'pb-8'
        }`}>
          {children}
        </main>

        <footer className={`border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500 ${
          isInspector ? 'mb-16 md:mb-0' : ''
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Nirikshan Systems. Inspect Smarter. Operate Better.</span>
            <span className="font-mono text-[11px] text-slate-400">
              Phase 2 • Dexie.js IndexedDB Active
            </span>
          </div>
        </footer>
      </div>

      {/* Inspector Mobile Bottom Navigation */}
      {isInspector && (
        <InspectorBottomNav
          onOpenDrawer={() => setMobileDrawerOpen(true)}
          pendingSyncCount={pendingSyncCount}
        />
      )}
    </div>
  );
};
