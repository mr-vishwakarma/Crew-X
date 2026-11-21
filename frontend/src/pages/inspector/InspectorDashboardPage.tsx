import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { dashboardService } from '../../services/dashboard.service';
import type {
  InspectorSummaryData,
  InspectorTaskItem,
} from '../../services/dashboard.service';
import {
  getDatabaseHealth,
  getPendingSyncCount,
  getLocalDraftsCount,
  createDemoLocalInspection,
  clearLocalDatabase,
  requestPersistentStorage,
  type DatabaseHealth,
} from '../../database/databaseHelpers';
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
  ArrowRight,
  AlertTriangle,
  Play,
  HardDrive,
  Trash2,
} from 'lucide-react';

export const InspectorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();

  // Dashboard Data State
  const [summary, setSummary] = useState<InspectorSummaryData | null>(null);
  const [tasks, setTasks] = useState<InspectorTaskItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // IndexedDB Local Storage State
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [draftsCount, setDraftsCount] = useState<number>(0);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [dbFeedback, setDbFeedback] = useState<string | null>(null);

  const refreshLocalDatabaseState = useCallback(async () => {
    const health = await getDatabaseHealth();
    const pending = await getPendingSyncCount();
    const drafts = await getLocalDraftsCount();

    setDbHealth(health);
    setPendingSyncCount(pending);
    setDraftsCount(drafts);
  }, []);

  useEffect(() => {
    const fetchInspectorData = async () => {
      try {
        const [sum, taskList] = await Promise.all([
          dashboardService.getInspectorSummary(),
          dashboardService.getInspectorMyInspections(),
        ]);
        setSummary(sum);
        setTasks(taskList);
      } catch (err) {
        console.error('Failed to load inspector data:', err);
      }
    };

    fetchInspectorData();
    refreshLocalDatabaseState();
    requestPersistentStorage();
  }, [refreshLocalDatabaseState]);

  const handleCreateTestOfflineInspection = async () => {
    setIsSeedingDemo(true);
    try {
      const created = await createDemoLocalInspection();
      setDbFeedback(`Saved draft "${created.siteName}" into local Dexie.js database!`);
      await refreshLocalDatabaseState();
      setTimeout(() => setDbFeedback(null), 4000);
    } catch {
      setDbFeedback('Failed to write to local database');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleClearLocalData = async () => {
    await clearLocalDatabase();
    setDbFeedback('Cleared demo local records');
    await refreshLocalDatabaseState();
    setTimeout(() => setDbFeedback(null), 3000);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DUE_TODAY') return t.dueDate.includes('Today');
    if (activeFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    return true;
  });

  const nextTask = tasks[0];

  // 7 Inspector KPI Cards
  const kpiCards = [
    {
      label: 'Assigned',
      value: summary?.assignedInspections ?? 8,
      icon: ClipboardCheck,
      color: 'text-blue-600',
    },
    {
      label: 'Due Today',
      value: summary?.dueToday ?? 3,
      icon: Clock,
      color: 'text-amber-600',
      isHighlight: true,
    },
    {
      label: 'In Progress',
      value: summary?.inProgress ?? 2,
      icon: Play,
      color: 'text-indigo-600',
    },
    {
      label: 'Local Drafts',
      value: draftsCount || (summary?.draftInspections ?? 1),
      icon: FileEdit,
      color: 'text-purple-600',
    },
    {
      label: 'Completed',
      value: summary?.completedInspections ?? 34,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    {
      label: 'Overdue',
      value: summary?.overdue ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
    },
    {
      label: 'Pending Sync',
      value: pendingSyncCount,
      icon: RefreshCw,
      color: 'text-[#d4f22c]',
      isSyncCard: true,
    },
  ];

  return (
    <AuthenticatedLayout
      title="Field Inspector Terminal"
      subtitle={`Mobile Field Audits • ${user?.fullName}`}
    >
      <div className="space-y-6">
        {/* Mobile Header Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#d4f22c] text-[#12141a] uppercase tracking-wider">
                  FIELD AUDIT READY
                </span>
                <span className="text-xs text-slate-500 font-medium">Offline IndexedDB Storage Active</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs text-slate-500 max-w-xl">
                All inspection checklists, GPS coordinates, and camera photos operate 100% offline
                in low-connectivity field areas.
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

        {/* 7 Inspector KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  kpi.isSyncCard
                    ? 'bg-[#12141a] text-white border-black shadow-xs'
                    : kpi.isHighlight
                    ? 'bg-[#d4f22c]/20 border-[#d4f22c] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      kpi.isSyncCard ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {kpi.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-black tracking-tight leading-none">{kpi.value}</div>
              </div>
            );
          })}
        </div>

        {/* Section A: Next Priority Inspection Hero Card */}
        {nextTask && (
          <div className="bg-[#12141a] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#d4f22c]/10 to-transparent rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#d4f22c] text-[#12141a] uppercase tracking-wider">
                    NEXT UPCOMING TASK
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{nextTask.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {nextTask.priority} PRIORITY
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {nextTask.title}
                </h3>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Supervisor Instructions: {nextTask.instructions}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4f22c]" />
                    {nextTask.siteName} ({nextTask.location})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due: {nextTask.dueDate}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => navigate('/inspector/checklist')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#d4f22c] hover:bg-[#c6e61f] text-[#12141a] font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-[#12141a]" />
                  <span>Execute Inspection Form</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section B & C: Inspection Queue & Local Storage Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section B: My Inspection Queue (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">My Inspection Queue</h3>
                <p className="text-xs text-slate-500">Scheduled field checkpoints and checklists</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                {['ALL', 'DUE_TODAY', 'IN_PROGRESS'].map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setActiveFilter(flt)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeFilter === flt
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {flt.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/inspector/checklist')}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{t.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">({t.code})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>{t.projectName}</span>
                      <span>•</span>
                      <span>{t.siteName}</span>
                      <span>•</span>
                      <span className="text-slate-400">Due: {t.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-200 text-slate-700">
                      {t.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/inspector/checklist');
                      }}
                      className="p-1.5 rounded-lg bg-[#12141a] text-white hover:bg-slate-800 transition-colors"
                      title="Open Checklist"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Local Dexie.js Offline Storage & Health (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Local Offline Storage
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Dexie v4 Active
              </span>
            </div>

            {/* Offline status alert */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isOnline
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50/70 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-semibold">
                  {isOnline ? 'Online (Connected to Atlas)' : 'Offline (Local IndexedDB Mode)'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Persistence:</span>
                <span className="font-bold text-slate-900">
                  {dbHealth?.isPersistentStorage ? 'Granted' : 'Session Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Sync Items:</span>
                <span className="font-bold text-slate-900">{pendingSyncCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cached Local Drafts:</span>
                <span className="font-bold text-slate-900">{draftsCount}</span>
              </div>
            </div>

            {dbFeedback && (
              <div className="p-2.5 rounded-xl bg-[#d4f22c]/20 border border-[#d4f22c] text-xs font-medium text-slate-800">
                {dbFeedback}
              </div>
            )}

            {/* Offline Sandbox Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCreateTestOfflineInspection}
                disabled={isSeedingDemo}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Simulate Offline Draft Creation</span>
              </button>

              <button
                type="button"
                onClick={handleClearLocalData}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Local Demo Cache</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
