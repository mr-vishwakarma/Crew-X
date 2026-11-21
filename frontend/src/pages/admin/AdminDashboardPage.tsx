import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Building2,
  MapPin,
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileCheck2,
  Clock,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const metrics = [
    { label: 'Total Projects', value: 14, icon: Building2, color: 'blue' as const, subtext: 'Across 4 geographic zones' },
    { label: 'Total Sites', value: 48, icon: MapPin, color: 'indigo' as const, subtext: '39 active, 9 maintenance' },
    { label: 'Total Supervisors', value: 12, icon: UserCheck, color: 'emerald' as const, subtext: 'Full operations coverage' },
    { label: 'Total Inspectors', value: 86, icon: Users, color: 'slate' as const, subtext: '72 online in field' },
    { label: 'Active Inspections', value: 32, icon: CheckCircle2, color: 'blue' as const, subtext: '18 completed today' },
    { label: 'Overdue Inspections', value: 3, icon: AlertTriangle, color: 'red' as const, subtext: 'Action required' },
  ];

  const recentActivity = [
    {
      id: 'act-1',
      title: 'Safety Audit Submitted',
      site: 'Metro Central Expansion – Zone B',
      user: 'Ramesh Verma (Inspector)',
      time: '12 minutes ago',
      status: 'Compliant',
      statusColor: 'emerald',
    },
    {
      id: 'act-2',
      title: 'High-Risk Electrical Hazard Flagged',
      site: 'Terminal 3 Substation',
      user: 'Pooja Nair (Inspector)',
      time: '45 minutes ago',
      status: 'Flagged',
      statusColor: 'red',
    },
    {
      id: 'act-3',
      title: 'New Site Facility Provisioned',
      site: 'Solar Park Block 4',
      user: 'Vikram Mehta (Supervisor)',
      time: '2 hours ago',
      status: 'Site Created',
      statusColor: 'blue',
    },
    {
      id: 'act-4',
      title: 'ISO-45001 Template Revision Published',
      site: 'Organization HQ',
      user: 'System Administrator',
      time: '4 hours ago',
      status: 'v2.4 Active',
      statusColor: 'indigo',
    },
    {
      id: 'act-5',
      title: 'Batch Sync Completed (18 Devices)',
      site: 'Highway Viaduct Sector 9',
      user: 'Sync Engine',
      time: '5 hours ago',
      status: 'Synced',
      statusColor: 'emerald',
    },
  ];

  return (
    <AuthenticatedLayout
      title="Administrator Dashboard"
      subtitle={`Organization HQ • ${user?.organizationId || 'org_nirikshan_hq'}`}
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge role="ADMIN" />
                <span className="text-xs text-slate-500 font-medium">Global Organization Scope</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                Here is the real-time operational status across all projects, construction sites, and
                field inspection teams in your organization.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => navigate('/admin/projects')}
              >
                Create Project
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MapPin className="w-4 h-4" />}
                onClick={() => navigate('/admin/sites')}
              >
                Add Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserCheck className="w-4 h-4" />}
                onClick={() => navigate('/admin/supervisors')}
              >
                Provision Supervisor
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileCheck2 className="w-4 h-4" />}
                onClick={() => navigate('/admin/templates')}
              >
                New Template
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {metrics.map((m) => (
            <StatCard
              key={m.label}
              label={m.label}
              value={m.value}
              icon={m.icon}
              iconColor={m.color}
              subtext={m.subtext}
            />
          ))}
        </div>

        {/* Two-Column Analytics & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inspection Overview Card */}
          <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Inspection Overview</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">This Month</span>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Completed & Verified</span>
                    <span className="text-emerald-600">88.4% (312 audits)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">In Progress / Field Active</span>
                    <span className="text-blue-600">8.2% (29 audits)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '8.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Flagged for Resolution</span>
                    <span className="text-red-600">3.4% (12 audits)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '3.4%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Overall Compliance Rate:</span>
                  <span className="font-bold text-emerald-700">96.6%</span>
                </div>
                <p className="text-[11px] text-slate-500">Target KPI: 95.0%</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
                onClick={() => navigate('/admin/reports')}
              >
                View Detailed Reports
              </Button>
            </div>
          </div>

          {/* Recent Organization Activity List */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Organization Activity</h3>
              </div>
              <span className="text-xs text-slate-500">Real-time audit log</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{act.site}</span>
                      <span>•</span>
                      <span>{act.user}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.statusColor === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : act.statusColor === 'red'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {act.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Showing latest 5 audit events</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 font-semibold"
                onClick={() => navigate('/admin/inspections')}
              >
                View all inspections →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
