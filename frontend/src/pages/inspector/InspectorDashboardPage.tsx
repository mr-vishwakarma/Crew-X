import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  FileEdit,
  RefreshCw,
  PlusCircle,
  Camera,
  MapPin,
  Database,
  Wifi,
  WifiOff,
  Sparkles,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import {
  getDatabaseHealth,
  getPendingSyncCount,
  getLocalDraftsCount,
  getAllLocalInspections,
  createDemoLocalInspection,
  clearLocalDatabase,
  requestPersistentStorage,
  type DatabaseHealth,
} from '../../database/databaseHelpers';
import type { LocalInspection } from '../../database/schema';

export const InspectorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();

  // Local IndexedDB State
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [draftsCount, setDraftsCount] = useState<number>(0);
  const [localInspections, setLocalInspections] = useState<LocalInspection[]>([]);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [dbFeedback, setDbFeedback] = useState<string | null>(null);

  // Load and refresh IndexedDB metrics
  const refreshLocalDatabaseState = useCallback(async () => {
    const health = await getDatabaseHealth();
    const pending = await getPendingSyncCount();
    const drafts = await getLocalDraftsCount();
    const all = await getAllLocalInspections();

    setDbHealth(health);
    setPendingSyncCount(pending);
    setDraftsCount(drafts);
    setLocalInspections(all);
  }, []);

  useEffect(() => {
    refreshLocalDatabaseState();
    requestPersistentStorage();
  }, [refreshLocalDatabaseState]);

  const handleCreateTestOfflineInspection = async () => {
    setIsSeedingDemo(true);
    try {
      const created = await createDemoLocalInspection();
      setDbFeedback(`Created local draft "${created.siteName}" in Dexie.js NirikshanLocalDB!`);
      await refreshLocalDatabaseState();
      setTimeout(() => setDbFeedback(null), 5000);
    } catch {
      setDbFeedback('Failed to write to IndexedDB');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleClearLocalData = async () => {
    await clearLocalDatabase();
    setDbFeedback('Cleared local demo records from Dexie.js NirikshanLocalDB');
    await refreshLocalDatabaseState();
    setTimeout(() => setDbFeedback(null), 4000);
  };

  const upcomingInspections = [
    {
      id: 'insp-task-1',
      title: 'Scaffolding & Fall Protection Audit',
      siteName: 'Viaduct Section 4B',
      location: '28.6139° N, 77.2090° E',
      priority: 'High',
      priorityColor: 'red',
      dueDate: 'Today, 3:00 PM',
      isOfflineReady: true,
    },
    {
      id: 'insp-task-2',
      title: 'Concrete Pour Quality & Slump Test',
      siteName: 'Terminal 2 Footing',
      location: '28.5562° N, 77.1000° E',
      priority: 'Medium',
      priorityColor: 'amber',
      dueDate: 'Today, 5:30 PM',
      isOfflineReady: true,
    },
    {
      id: 'insp-task-3',
      title: 'Perimeter Hazard & Fire Barrier Check',
      siteName: 'North Warehouse Depot',
      location: '28.6304° N, 77.2177° E',
      priority: 'Routine',
      priorityColor: 'blue',
      dueDate: 'Tomorrow, 10:00 AM',
      isOfflineReady: true,
    },
  ];

  return (
    <AuthenticatedLayout
      title="Field Inspector Portal"
      subtitle={`Inspector Operations • ${user?.fullName}`}
    >
      <div className="space-y-5">
        {/* Mobile-Friendly Welcome Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge role="INSPECTOR" />
                <span className="text-xs text-slate-500 font-medium">Field Operations</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs text-slate-500 max-w-xl">
                Ready for field inspection audits. All forms, photos, and checklist answers are
                saved locally in IndexedDB when you are offline.
              </p>
            </div>

            {/* Quick Actions (Large Touch Targets for Field Conditions) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="w-full sm:w-auto"
                onClick={() => navigate('/inspector/checklist')}
              >
                Start New Inspection
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<Camera className="w-4 h-4" />}
                className="w-full sm:w-auto"
                onClick={() => navigate('/inspector/evidence')}
              >
                Photo Evidence
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full sm:w-auto"
                onClick={() => navigate('/inspector/sync')}
              >
                Sync Centre ({pendingSyncCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Live Field & Storage Health Status Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Nirikshan Local Database</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {dbHealth?.isAvailable ? 'Dexie v4 Active' : 'Initializing...'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                IndexedDB Database: <code className="text-blue-300 font-mono">NirikshanLocalDB</code> •{' '}
                {dbHealth?.tables.inspectionsCount || 0} inspections,{' '}
                {dbHealth?.tables.syncQueueCount || 0} in queue
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Connectivity Signal */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isOnline
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online (Connected)' : 'Offline (Local Mode)'}</span>
            </div>

            {/* Persistent Storage Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-800 text-slate-300 border-slate-700 text-xs font-medium">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>{dbHealth?.isPersistentStorage ? 'Persistent Storage OK' : 'Storage Active'}</span>
            </div>
          </div>
        </div>

        {/* Database Feedback Alert */}
        {dbFeedback && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{dbFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setDbFeedback(null)}
              className="text-blue-700 hover:text-blue-950 p-1 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            label="Assigned"
            value={5}
            icon={ClipboardCheck}
            iconColor="blue"
            subtext="Assigned work orders"
          />
          <StatCard
            label="Due Today"
            value={2}
            icon={Clock}
            iconColor="amber"
            subtext="Needs completion"
          />
          <StatCard
            label="Completed"
            value={14}
            icon={CheckCircle2}
            iconColor="emerald"
            subtext="This month"
          />
          <StatCard
            label="Local Drafts"
            value={draftsCount}
            icon={FileEdit}
            iconColor="indigo"
            subtext="Stored in Dexie.js"
          />
          <StatCard
            label="Pending Sync"
            value={pendingSyncCount}
            icon={RefreshCw}
            iconColor={pendingSyncCount > 0 ? 'amber' : 'slate'}
            subtext="Queued in IndexedDB"
            onClick={() => navigate('/inspector/sync')}
          />
        </div>

        {/* Two Columns: Upcoming Inspections & Local IndexedDB Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Field Inspections */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">My Upcoming Inspections</h3>
              </div>
              <span className="text-xs text-slate-500">Scheduled for today</span>
            </div>

            <div className="space-y-3">
              {upcomingInspections.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {task.title}
                      </h4>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          task.priorityColor === 'red'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : task.priorityColor === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">{task.siteName}</span>
                      <span>•</span>
                      <span className="text-[11px] font-mono text-slate-400">{task.location}</span>
                    </p>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due: {task.dueDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/inspector/checklist')}
                    >
                      Open Form
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 font-semibold"
                onClick={() => navigate('/inspector/inspections')}
              >
                View all personal assigned inspections →
              </Button>
            </div>
          </div>

          {/* IndexedDB Live Status & DevTools Helper Panel */}
          <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Local IndexedDB Storage</h3>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Dexie.js
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                This client uses <strong>NirikshanLocalDB</strong> in IndexedDB for reliable offline
                operation in low-connectivity construction zones.
              </p>

              {/* Live Table Metrics */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Table: inspections</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {dbHealth?.tables.inspectionsCount || 0} records
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Table: photos</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {dbHealth?.tables.photosCount || 0} blobs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Table: syncQueue</span>
                  <span className="font-bold text-amber-700 font-mono">
                    {dbHealth?.tables.syncQueueCount || 0} items
                  </span>
                </div>
              </div>

              {/* DevTools inspection instructions */}
              <div className="text-[11px] text-slate-500 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                💡 <strong>DevTools Check:</strong> Open browser <em>F12 → Application → Storage → IndexedDB → NirikshanLocalDB</em> to verify records directly.
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold"
                isLoading={isSeedingDemo}
                onClick={handleCreateTestOfflineInspection}
              >
                + Add Test Draft to IndexedDB
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-[11px] text-slate-500 hover:text-slate-700"
                  onClick={refreshLocalDatabaseState}
                >
                  Refresh DB Stats
                </Button>
                {localInspections.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-red-600 hover:text-red-700"
                    leftIcon={<Trash2 className="w-3 h-3" />}
                    onClick={handleClearLocalData}
                  >
                    Clear Demo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
