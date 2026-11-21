import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { dashboardService } from '../../services/dashboard.service';
import { assignmentService } from '../../services/assignment.service';
import type {
  InspectorSummaryData,
} from '../../services/dashboard.service';
import type { InspectorAssignedSite } from '../../types/assignment.types';
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
  MapPin,
  Database,
  Play,
  Building2,
} from 'lucide-react';

export const InspectorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();

  // Dashboard Data State
  const [summary, setSummary] = useState<InspectorSummaryData | null>(null);
  const [assignedSites, setAssignedSites] = useState<InspectorAssignedSite[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      setIsLoading(true);
      try {
        const [sum, siteList, taskList] = await Promise.all([
          dashboardService.getInspectorSummary(),
          assignmentService.getInspectorMySites(),
          assignmentService.getInspectorMyAssignments(),
        ]);
        setSummary(sum);
        setAssignedSites(siteList);
        setTasks(taskList);
      } catch (err) {
        console.error('Failed to load inspector data:', err);
      } finally {
        setIsLoading(false);
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
    if (activeFilter === 'DUE_TODAY') return t.dueDate?.includes('Today');
    if (activeFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    return true;
  });

  const nextTask = tasks[0];

  // 7 KPI Cards
  const kpiCards = [
    {
      label: 'Assigned Sites',
      value: assignedSites.length,
      icon: MapPin,
      color: 'text-emerald-600',
    },
    {
      label: 'Assigned Audits',
      value: summary?.assignedInspections ?? 0,
      icon: ClipboardCheck,
      color: 'text-blue-600',
    },
    {
      label: 'Due Today',
      value: summary?.dueToday ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      isHighlight: (summary?.dueToday ?? 0) > 0,
    },
    {
      label: 'In Progress',
      value: summary?.inProgress ?? 0,
      icon: Play,
      color: 'text-indigo-600',
    },
    {
      label: 'Local Drafts',
      value: draftsCount || (summary?.draftInspections ?? 0),
      icon: FileEdit,
      color: 'text-purple-600',
    },
    {
      label: 'Completed',
      value: summary?.completedInspections ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
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
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Offline IndexedDB Storage Active</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs text-slate-500 max-w-xl">
                Authorized for {assignedSites.length} active construction sites. Checklists, GPS stamps, and camera evidence operate 100% offline.
              </p>
            </div>

            {/* Quick Actions */}
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
                leftIcon={<MapPin className="w-4 h-4" />}
                className="w-full sm:w-auto"
                onClick={() => navigate('/inspector/my-sites')}
              >
                My Sites ({assignedSites.length})
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

        {/* Empty State Banner if no sites assigned */}
        {!isLoading && assignedSites.length === 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                No site assignments yet. Contact your Supervisor.
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                You must be assigned to an active construction site by your operations supervisor before you can perform site-level audits.
              </p>
            </div>
          </div>
        )}

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

        {/* Section A: Next Priority Inspection Banner (if assigned) */}
        {nextTask && (
          <div className="bg-gradient-to-r from-[#12141a] to-[#1e222d] border border-black rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4f22c]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white">
                    {nextTask.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#d4f22c] text-[#12141a] uppercase tracking-wider">
                    {nextTask.priority} PRIORITY
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {nextTask.title}
                </h3>

                {nextTask.instructions && (
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Supervisor Instructions: "{nextTask.instructions}"
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4f22c]" />
                    {nextTask.siteName} ({nextTask.location})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due: {new Date(nextTask.dueDate).toLocaleDateString()}
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

        {/* Section B & C: Permitted Sites & Inspection Queue */}
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

            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No inspection assignments yet. Contact your Supervisor.
              </div>
            ) : (
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
                        <span className="text-slate-400">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
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
                        className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section C: Permitted Sites (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                My Permitted Sites
              </h3>
              <span className="text-[11px] text-slate-400">{assignedSites.length} Active</span>
            </div>

            {assignedSites.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No site assignments yet. Contact your Supervisor.
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignedSites.map((item) => (
                  <div
                    key={item.assignmentId}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.site.siteName}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {item.site.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      <span>{item.project?.projectName || 'Project'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Supervisor: {item.assigningSupervisor?.fullName || 'Assigned'}</span>
                      <span>{item.site.city || 'Active Zone'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Offline IndexedDB diagnostics widget */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-blue-600" />
                  Dexie.js Offline Storage
                </span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {dbHealth?.isPersistentStorage ? 'Persistent' : dbHealth?.isAvailable ? 'Active' : 'Initializing'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTestOfflineInspection}
                  disabled={isSeedingDemo}
                  className="flex-1 text-[11px]"
                >
                  Save Local Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearLocalData}
                  className="text-[11px] text-rose-600"
                >
                  Clear Local
                </Button>
              </div>
              {dbFeedback && (
                <p className="text-[10px] text-emerald-600 font-medium text-center">{dbFeedback}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
