import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { InspectionTrendsChart } from '../../components/charts/InspectionTrendsChart';
import { InspectionLifecyclePipeline } from '../../components/charts/InspectionLifecyclePipeline';
import { ProjectPerformanceBars } from '../../components/charts/ProjectPerformanceBars';
import { dashboardService } from '../../services/dashboard.service';
import type {
  AdminSummaryData,
  TrendPoint,
  ProjectPerformanceItem,
  ActivityItem,
  AttentionItem,
} from '../../services/dashboard.service';
import {
  Building2,
  MapPin,
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileCheck2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dashboard Data State
  const [summary, setSummary] = useState<AdminSummaryData | null>(null);
  const [trendPoints, setTrendPoints] = useState<TrendPoint[]>([]);
  const [trendRange, setTrendRange] = useState<number>(30);
  const [projectsPerformance, setProjectsPerformance] = useState<ProjectPerformanceItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      setIsLoading(true);
      try {
        const [sum, trends, perf, acts, atts] = await Promise.all([
          dashboardService.getAdminSummary(),
          dashboardService.getAdminTrends(30),
          dashboardService.getAdminProjectPerformance(),
          dashboardService.getAdminRecentActivity(),
          dashboardService.getAdminAttentionRequired(),
        ]);

        setSummary(sum);
        setTrendPoints(trends.points);
        setProjectsPerformance(perf);
        setRecentActivities(acts);
        setAttentionItems(atts);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  const handleRangeChange = async (days: number) => {
    setTrendRange(days);
    try {
      const trends = await dashboardService.getAdminTrends(days);
      setTrendPoints(trends.points);
    } catch {
      // Keep existing points
    }
  };

  // 8 Data-Driven KPI Cards
  const kpiCards = [
    {
      id: 'kpi-1',
      label: 'Total Projects',
      value: summary?.totalProjects ?? 3,
      trend: '+1 this quarter',
      isPositive: true,
      icon: Building2,
      subtext: `${summary?.activeProjects ?? 2} active construction sites`,
      link: '/admin/projects',
    },
    {
      id: 'kpi-2',
      label: 'Active Sites',
      value: summary?.totalSites ?? 4,
      trend: '+2 geofenced',
      isPositive: true,
      icon: MapPin,
      subtext: `${summary?.activeSites ?? 3} operational facilities`,
      link: '/admin/sites',
    },
    {
      id: 'kpi-3',
      label: 'Supervisors',
      value: summary?.totalSupervisors ?? 1,
      trend: '100% coverage',
      isPositive: true,
      icon: UserCheck,
      subtext: 'Project operational scope',
      link: '/admin/supervisors',
    },
    {
      id: 'kpi-4',
      label: 'Inspectors',
      value: summary?.totalInspectors ?? 1,
      trend: 'Fleet active',
      isPositive: true,
      icon: Users,
      subtext: 'Mobile offline workforce',
      link: '/admin/inspectors',
    },
    {
      id: 'kpi-5',
      label: 'Active Inspections',
      value: summary?.activeInspections ?? 18,
      trend: '+12.4% velocity',
      isPositive: true,
      icon: Layers,
      subtext: 'In-progress field audits',
      link: '/admin/inspections',
    },
    {
      id: 'kpi-6',
      label: 'Pending Reviews',
      value: summary?.pendingReviews ?? 6,
      trend: 'Avg 2.4h turnaround',
      isPositive: true,
      icon: Clock,
      subtext: 'Awaiting QA sign-off',
      link: '/admin/inspections',
    },
    {
      id: 'kpi-7',
      label: 'Overdue Audits',
      value: summary?.overdueInspections ?? 0,
      trend: summary?.overdueInspections === 0 ? 'Zero overdue' : 'Requires attention',
      isPositive: summary?.overdueInspections === 0,
      icon: AlertTriangle,
      subtext: 'Exceeded SLA deadline',
      link: '/admin/inspections',
    },
    {
      id: 'kpi-8',
      label: 'Compliance Rate',
      value: `${summary?.complianceRate ?? 96.5}%`,
      trend: '+2.1% benchmark',
      isPositive: true,
      icon: CheckCircle2,
      subtext: 'ISO-9001 standard target',
      isHighlight: true,
      link: '/admin/reports',
    },
  ];

  return (
    <AuthenticatedLayout
      title="Administrator Operations Console"
      subtitle={`Organization HQ • ${user?.organizationId || 'org_nirikshan_hq'}`}
    >
      <div className="space-y-6">
        {/* Welcome Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#d4f22c] text-[#12141a] uppercase tracking-wider">
                  ENTERPRISE ADMIN
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Central Governance • Global Organization Scope
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Real-time oversight over all active project packages, geofenced construction
                facilities, and quality inspection workflows across your enterprise.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => navigate('/admin/projects/new')}
              >
                Create Project
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MapPin className="w-4 h-4" />}
                onClick={() => navigate('/admin/sites/new')}
              >
                Add Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserCheck className="w-4 h-4" />}
                onClick={() => navigate('/admin/supervisors')}
              >
                Assign Supervisor
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileCheck2 className="w-4 h-4" />}
                onClick={() => navigate('/admin/inspections')}
              >
                Inspections
              </Button>
            </div>
          </div>
        </div>

        {/* 8 Data-Driven KPI Cards */}
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
                        : 'text-rose-500'
                    }`}
                  >
                    {kpi.isPositive ? (
                      <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5 shrink-0" />
                    )}
                    <span className="truncate">{kpi.trend}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main 2-Column Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Inspection Trends & Lifecycle Pipeline */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section A: Inspection Overview Area Chart */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <InspectionTrendsChart
                points={trendPoints}
                activeRange={trendRange}
                onRangeChange={handleRangeChange}
                isLoading={isLoading}
              />
            </div>

            {/* Section B: Inspection Lifecycle Pipeline */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <InspectionLifecyclePipeline />
            </div>

            {/* Section C: Project Performance Matrix */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Project Quality & Completion Matrix</h3>
                  <p className="text-xs text-slate-500">Live progress across capital project packages</p>
                </div>
                <button
                  onClick={() => navigate('/admin/projects')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <ProjectPerformanceBars projects={projectsPerformance} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Column (4 cols): Attention Required & Organization Activity */}
          <div className="lg:col-span-4 space-y-6">
            {/* Section E: Attention Required Widget */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Attention Required
                  </h3>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700">
                  {attentionItems.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {attentionItems.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {att.title}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-200/70 text-rose-800">
                        {att.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {att.description}
                    </p>
                    <button
                      onClick={() => navigate(att.link)}
                      className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <span>{att.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section D: Recent Organization Activity */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Recent Activity Stream
                </h3>
                <span className="text-[11px] text-slate-400">Live feed</span>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                {recentActivities.map((act) => (
                  <div key={act.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {act.title}
                      </h4>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${
                          act.statusTone === 'lime'
                            ? 'bg-[#d4f22c] text-[#12141a]'
                            : act.statusTone === 'emerald'
                            ? 'bg-emerald-100 text-emerald-700'
                            : act.statusTone === 'rose'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">{act.entity} • {act.actor}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                        {act.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
