import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../layouts/AuthenticatedLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Building2,
  Users,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  PlusCircle,
  FileSearch,
} from 'lucide-react';

export const SupervisorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const supervisorMetrics = [
    { label: 'Assigned Projects', value: 3, icon: Building2, color: 'blue' as const, subtext: 'Authorized scope' },
    { label: 'Managed Inspectors', value: 16, icon: Users, color: 'indigo' as const, subtext: 'Field team roster' },
    { label: 'Active Assignments', value: 24, icon: ClipboardList, color: 'slate' as const, subtext: 'Currently in progress' },
    { label: 'Pending Reviews', value: 7, icon: FileCheck, color: 'amber' as const, subtext: 'Requires QA sign-off' },
    { label: 'Overdue Inspections', value: 1, icon: AlertTriangle, color: 'red' as const, subtext: 'Escalation required' },
  ];

  const assignedProjectsList = [
    {
      id: 'proj-101',
      name: 'Metro Underground Corridors – Line 4',
      sitesCount: 8,
      inspectorsCount: 7,
      progress: 78,
      status: 'Active',
    },
    {
      id: 'proj-102',
      name: 'Solar Grid Substation Facilities',
      sitesCount: 4,
      inspectorsCount: 5,
      progress: 92,
      status: 'Active',
    },
    {
      id: 'proj-103',
      name: 'Highway Overpass Structural Reinforcement',
      sitesCount: 3,
      inspectorsCount: 4,
      progress: 45,
      status: 'Under Review',
    },
  ];

  const recentSupervisorActivities = [
    {
      id: 'sub-act-1',
      title: 'Structural Integrity Audit Submitted for QA',
      site: 'Pier 14 Viaduct',
      inspector: 'Amit Sharma',
      time: '20 minutes ago',
      actionNeeded: 'Review & Sign-Off',
    },
    {
      id: 'sub-act-2',
      title: 'Hydraulic Test Checklist Completed',
      site: 'Substation Pump Room',
      inspector: 'Kavita Roy',
      time: '1 hour ago',
      actionNeeded: 'Verified',
    },
    {
      id: 'sub-act-3',
      title: 'Discrepancy Reported in Concrete Curing Log',
      site: 'Pier 12 Abutment',
      inspector: 'Deepak Patel',
      time: '3 hours ago',
      actionNeeded: 'Conflict Resolution',
    },
  ];

  return (
    <AuthenticatedLayout
      title="Supervisor Operations Dashboard"
      subtitle={`Assigned Operations Scope • ${user?.fullName}`}
    >
      <div className="space-y-6">
        {/* Welcome & Scope Notice */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge role="SUPERVISOR" />
                <span className="text-xs text-slate-500 font-medium">Assigned Projects Scope</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                You are managing <span className="font-semibold text-slate-800">3 projects</span> and{' '}
                <span className="font-semibold text-slate-800">16 field inspectors</span>. You have
                jurisdiction over work assignments, review submissions, and conflict resolution.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/assignments')}
              >
                Assign Work Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileSearch className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/reports')}
              >
                Review Submissions (7)
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Users className="w-4 h-4" />}
                onClick={() => navigate('/supervisor/inspectors')}
              >
                Manage Inspectors
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                onClick={() => navigate('/supervisor/conflicts')}
              >
                Conflicts
              </Button>
            </div>
          </div>
        </div>

        {/* Supervisor Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {supervisorMetrics.map((m) => (
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

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Projects Status */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Assigned Projects Overview</h3>
              </div>
              <span className="text-xs text-slate-500">Authorized Scope Only</span>
            </div>

            <div className="space-y-4">
              {assignedProjectsList.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{proj.name}</h4>
                      <p className="text-xs text-slate-500">
                        {proj.sitesCount} Sites • {proj.inspectorsCount} Inspectors Assigned
                      </p>
                    </div>
                    <span className="px-2 py-0.5 self-start sm:self-auto rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {proj.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Inspection Completion</span>
                      <span className="font-bold text-slate-900">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 font-semibold"
                onClick={() => navigate('/supervisor/projects')}
              >
                View all authorized project details →
              </Button>
            </div>
          </div>

          {/* Pending Reviews & Conflicts Panel */}
          <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Action Items</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  7 Pending
                </span>
              </div>

              <div className="space-y-3">
                {recentSupervisorActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">{act.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Site: <span className="text-slate-700 font-medium">{act.site}</span> • By {act.inspector}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                      <span className="text-[10px] font-semibold text-blue-600">
                        {act.actionNeeded}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => navigate('/supervisor/reports')}
              >
                Review All Pending Submissions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
