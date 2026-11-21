import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { dashboardService } from '../../services/dashboard.service';
import { assignmentService } from '../../services/assignment.service';
import type {
  SupervisorSummaryData,
  ReviewQueueItem,
} from '../../services/dashboard.service';
import type { SupervisorProject } from '../../types/assignment.types';
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
  const [assignedProjects, setAssignedProjects] = useState<SupervisorProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      setIsLoading(true);
      try {
        const [sum, reviews, projs] = await Promise.all([
          dashboardService.getSupervisorSummary(),
          dashboardService.getSupervisorReviewQueue(),
          assignmentService.getSupervisorProjects(),
        ]);
        setSummary(sum);
        setReviewQueue(reviews);
        setAssignedProjects(projs);
      } catch (err) {
        console.error('Failed to load supervisor dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupervisorData();
  }, []);

  // 8 Supervisor KPI Cards
  const kpiCards = [
    {
      id: 'sup-kpi-1',
      label: 'Assigned Projects',
      value: summary?.assignedProjectsCount ?? 0,
      trend: 'Scope authorized',
      isPositive: (summary?.assignedProjectsCount ?? 0) > 0,
      icon: Building2,
      link: '/supervisor/projects',
    },
    {
      id: 'sup-kpi-2',
      label: 'Managed Sites',
      value: summary?.managedSitesCount ?? 0,
      trend: 'Under assigned projects',
      isPositive: (summary?.managedSitesCount ?? 0) > 0,
      icon: MapPin,
      link: '/supervisor/sites',
    },
    {
      id: 'sup-kpi-3',
      label: 'Field Inspectors',
      value: summary?.managedInspectorsCount ?? 0,
      trend: 'Assigned on sites',
      isPositive: (summary?.managedInspectorsCount ?? 0) > 0,
      icon: Users,
      link: '/supervisor/sites',
    },
    {
      id: 'sup-kpi-4',
      label: 'Active Assignments',
      value: summary?.activeAssignmentsCount ?? 0,
      trend: 'Live site bindings',
      isPositive: (summary?.activeAssignmentsCount ?? 0) > 0,
      icon: ClipboardList,
      link: '/supervisor/sites',
    },
    {
      id: 'sup-kpi-5',
      label: 'Due Today',
      value: summary?.dueTodayCount ?? 0,
      trend: 'Scheduled today',
      isPositive: true,
      icon: Clock,
      link: '/supervisor/inspections',
    },
    {
      id: 'sup-kpi-6',
      label: 'Pending Reviews',
      value: summary?.pendingReviewsCount ?? 0,
      trend: 'Requires QA check',
      isPositive: (summary?.pendingReviewsCount ?? 0) === 0,
      icon: FileSearch,
      isHighlight: (summary?.pendingReviewsCount ?? 0) > 0,
      link: '/supervisor/reports',
    },
    {
      id: 'sup-kpi-7',
      label: 'Overdue Audits',
      value: summary?.overdueCount ?? 0,
      trend: summary?.overdueCount === 0 ? 'Zero overdue' : 'Escalation',
      isPositive: (summary?.overdueCount ?? 0) === 0,
      icon: AlertTriangle,
      link: '/supervisor/inspections',
    },
    {
      id: 'sup-kpi-8',
      label: 'Sync Status',
      value: '100%',
      trend: 'Operational',
      isPositive: true,
      icon: CheckCircle2,
      link: '/supervisor/sync',
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
                  Assigned Project Scope • Quality &amp; Safety QA
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Managing {summary?.assignedProjectsCount ?? 0} authorized project scopes and {summary?.managedInspectorsCount ?? 0} field inspectors. Review
                submitted audits, resolve field discrepancies, and allocate today's work orders.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/sites')}
                className="bg-[#12141a] text-white"
              >
                Assign Inspector
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MapPin className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/sites')}
              >
                Project Sites
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Building2 className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/projects')}
              >
                My Projects ({assignedProjects.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Empty State Banner if no projects assigned */}
        {!isLoading && assignedProjects.length === 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                No projects assigned yet. Contact your Administrator.
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                An administrator must assign your supervisor account to one or more active projects before you can manage sites and dispatch field inspectors.
              </p>
            </div>
          </div>
        )}

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

        {/* Section: Review Queue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
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

          {reviewQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No pending inspection reviews in your assigned projects.
            </div>
          ) : (
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
          )}
        </div>

        {/* Section: Assigned Projects Overview */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Project Scope &amp; Progress</h3>
              <p className="text-xs text-slate-500">
                Active packages under your operational supervision
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

          {assignedProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No projects currently assigned. Please contact your Administrator.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assignedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/supervisor/sites?projectId=${p.id}`)}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {p.projectName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Code: {p.projectCode}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{p.sitesCount} Sites</span>
                    <span>{p.activeInspectorsCount} Inspectors</span>
                    <span className="text-emerald-600 font-bold">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
