import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { dashboardService } from '../../services/dashboard.service';
import type {
  SupervisorSummaryData,
  ReviewQueueItem,
} from '../../services/dashboard.service';
import {
  Building2,
  MapPin,
  Users,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowRight,
  FileSearch,
} from 'lucide-react';

export const SupervisorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SupervisorSummaryData | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        const [sum, reviews] = await Promise.all([
          dashboardService.getSupervisorSummary(),
          dashboardService.getSupervisorReviewQueue(),
        ]);
        setSummary(sum);
        setReviewQueue(reviews);
      } catch (err) {
        console.error('Failed to load supervisor dashboard:', err);
      }
    };

    fetchSupervisorData();
  }, []);

  // 8 Supervisor KPI Cards
  const kpiCards = [
    {
      id: 'sup-kpi-1',
      label: 'Assigned Projects',
      value: summary?.assignedProjectsCount ?? 3,
      trend: 'Scope authorized',
      isPositive: true,
      icon: Building2,
      link: '/supervisor/projects',
    },
    {
      id: 'sup-kpi-2',
      label: 'Managed Sites',
      value: summary?.managedSitesCount ?? 8,
      trend: 'All active',
      isPositive: true,
      icon: MapPin,
      link: '/supervisor/sites',
    },
    {
      id: 'sup-kpi-3',
      label: 'Field Inspectors',
      value: summary?.managedInspectorsCount ?? 16,
      trend: 'Active roster',
      isPositive: true,
      icon: Users,
      link: '/supervisor/inspectors',
    },
    {
      id: 'sup-kpi-4',
      label: 'Active Assignments',
      value: summary?.activeAssignmentsCount ?? 19,
      trend: 'In progress',
      isPositive: true,
      icon: ClipboardList,
      link: '/supervisor/assignments',
    },
    {
      id: 'sup-kpi-5',
      label: 'Due Today',
      value: summary?.dueTodayCount ?? 5,
      trend: 'Scheduled',
      isPositive: true,
      icon: Clock,
      link: '/supervisor/inspections',
    },
    {
      id: 'sup-kpi-6',
      label: 'Pending Reviews',
      value: summary?.pendingReviewsCount ?? 4,
      trend: 'Requires QA check',
      isPositive: false,
      icon: FileSearch,
      isHighlight: true,
      link: '/supervisor/reports',
    },
    {
      id: 'sup-kpi-7',
      label: 'Overdue Audits',
      value: summary?.overdueCount ?? 0,
      trend: summary?.overdueCount === 0 ? 'Zero overdue' : 'Escalation',
      isPositive: summary?.overdueCount === 0,
      icon: AlertTriangle,
      link: '/supervisor/inspections',
    },
    {
      id: 'sup-kpi-8',
      label: 'Sync Status',
      value: '100%',
      trend: 'All devices synced',
      isPositive: true,
      icon: CheckCircle2,
      link: '/supervisor/sync',
    },
  ];

  // Assigned Projects & Sites List
  const assignedProjects = [
    {
      id: 'proj-1',
      name: 'Metro Underground Corridors – Line 4',
      code: 'METRO-L4',
      sitesCount: 8,
      inspectorsCount: 7,
      progress: 78,
      compliance: '98.5%',
    },
    {
      id: 'proj-2',
      name: 'Solar Grid Substation Facilities',
      code: 'SOLAR-PV',
      sitesCount: 4,
      inspectorsCount: 5,
      progress: 92,
      compliance: '99.1%',
    },
    {
      id: 'proj-3',
      name: 'Highway Overpass Structural Reinforcement',
      code: 'HWY-OVER',
      sitesCount: 3,
      inspectorsCount: 4,
      progress: 45,
      compliance: '94.0%',
    },
  ];

  // Today's Inspection Schedule
  const todaySchedule = [
    {
      id: 'sch-1',
      inspector: 'Amit Sharma',
      site: 'Viaduct Section 4B',
      type: 'Structural Rebar Cover Inspection',
      time: '11:00 AM',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
    {
      id: 'sch-2',
      inspector: 'Kavita Roy',
      site: 'Terminal 3 Substation',
      type: 'Transformer Secondary Grounding Test',
      time: '1:30 PM',
      priority: 'CRITICAL',
      status: 'SCHEDULED',
    },
    {
      id: 'sch-3',
      inspector: 'Deepak Patel',
      site: 'Depot Footing Block A',
      type: 'Concrete Slump & Compression Core Sample',
      time: '3:30 PM',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
    },
    {
      id: 'sch-4',
      inspector: 'Sunil Nair',
      site: 'Pier 12 Abutment',
      type: 'Waterproofing Membrane Verification',
      time: '5:00 PM',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
    },
  ];

  return (
    <AuthenticatedLayout
      title="Supervisor Operations Cockpit"
      subtitle={`Assigned Operations Scope • ${user?.fullName}`}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#d4f22c] text-[#12141a] uppercase tracking-wider">
                  FIELD COMMAND
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Assigned Project Scope • Quality & Safety QA
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                You are currently managing 3 active project scopes and 16 field inspectors. Review
                submitted audits, resolve field discrepancies, and allocate today's work orders.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/assignments')}
              >
                Create Assignment
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileSearch className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/reports')}
              >
                Review Queue ({reviewQueue.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Users className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/inspectors')}
              >
                Inspectors
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Building2 className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/projects')}
              >
                My Projects
              </Button>
            </div>
          </div>
        </div>

        {/* 8 Supervisor KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                onClick={() => navigate(kpi.link)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  kpi.isHighlight
                    ? 'bg-[#12141a] text-white border-black shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      kpi.isHighlight ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {kpi.label}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      kpi.isHighlight ? 'text-[#d4f22c]' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                    {kpi.value}
                  </div>
                  <div
                    className={`mt-1.5 flex items-center gap-1 text-[10px] font-medium truncate ${
                      kpi.isHighlight
                        ? 'text-[#d4f22c]'
                        : kpi.isPositive
                        ? 'text-emerald-600'
                        : 'text-amber-500'
                    }`}
                  >
                    <span className="truncate">{kpi.trend}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid: Review Queue (8 cols) & Today's Schedule (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section D: Review Queue */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-slate-900" />
                <h3 className="text-sm font-bold text-slate-900">
                  Field Submissions Awaiting Review
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {reviewQueue.length} Pending QA Approval
              </span>
            </div>

            <div className="space-y-3">
              {reviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 text-slate-700">
                        {item.code}
                      </span>
                      {item.priority === 'CRITICAL' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>{item.siteName}</span>
                      <span>•</span>
                      <span>Inspector: {item.inspectorName}</span>
                      <span>•</span>
                      <span className="text-slate-400">{item.submissionTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900">
                        {item.complianceScore}%
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Pass Score</div>
                    </div>
                    <button
                      onClick={() => navigate('/supervisor/reports')}
                      className="px-3 py-1.5 rounded-lg bg-[#12141a] text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Today's Inspection Schedule */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Today's Inspection Schedule
              </h3>
              <span className="text-[11px] text-slate-400">{todaySchedule.length} Dispatches</span>
            </div>

            <div className="space-y-3">
              {todaySchedule.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{sch.inspector}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {sch.time}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium truncate">{sch.type}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>{sch.site}</span>
                    <span
                      className={`font-extrabold ${
                        sch.priority === 'CRITICAL' ? 'text-rose-600' : 'text-slate-600'
                      }`}
                    >
                      {sch.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section B: Assigned Projects Overview */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Project Scope & Progress</h3>
              <p className="text-xs text-slate-500">
                Active capital packages under your operational supervision
              </p>
            </div>
            <button
              onClick={() => navigate('/supervisor/projects')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assignedProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate('/supervisor/projects')}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Code: {p.code}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-colors" />
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Inspection Completion</span>
                    <span className="font-extrabold text-slate-900">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${p.progress}%` }}
                      className="h-full bg-[#12141a] rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>{p.sitesCount} Sites</span>
                  <span>{p.inspectorsCount} Field Inspectors</span>
                  <span className="text-emerald-600 font-bold">{p.compliance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
