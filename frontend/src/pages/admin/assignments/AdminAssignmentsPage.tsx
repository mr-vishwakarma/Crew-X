import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { assignmentService } from '../../../services/assignment.service';
import type { AdminAssignmentsOverviewResponse } from '../../../types/assignment.types';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  ClipboardList,
  Building2,
  MapPin,
  Users,
  UserCheck,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AdminAssignmentsPage: React.FC = () => {
  const [data, setData] = useState<AdminAssignmentsOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await assignmentService.getAdminAssignmentsOverview();
      setData(res);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve assignments overview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <AuthenticatedLayout
      title="Work Order & Scope Assignments"
      subtitle="Organization-wide assignment matrix connecting projects to supervisors and construction sites to inspectors"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Operational Assignment Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Verified chain of custody: Administrator &rarr; Operations Supervisors &rarr; Field Inspectors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={fetchOverview}
            >
              Refresh Matrix
            </Button>
            <Link to="/admin/projects">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="h-4 w-4" />}
                className="bg-[#12141a] text-white"
              >
                Manage Projects
              </Button>
            </Link>
          </div>
        </div>

        {errorMessage && (
          <Alert type="error" title="Failed to Load Assignments" message={errorMessage} />
        )}

        {/* Real Dynamic Stats Grid */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Projects
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {data.stats.totalProjects}
                </span>
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                {data.stats.projectsWithSupervisors} with supervisor
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Supervised Projects
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {data.stats.projectsWithSupervisors}
                </span>
                <UserCheck className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {data.stats.projectsWithoutSupervisors} pending assignment
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Sites
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {data.stats.totalSites}
                </span>
                <MapPin className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                {data.stats.sitesWithInspectors} active staffing
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Sites with Inspectors
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {data.stats.sitesWithInspectors}
                </span>
                <Users className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {data.stats.sitesWithoutInspectors} unstaffed
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Active Site Dispatches
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {data.stats.activeSiteAssignmentsCount}
                </span>
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold block mt-1">
                Live inspector bindings
              </span>
            </div>
          </div>
        )}

        {/* Matrix Content */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading organizational matrix...</p>
          </div>
        ) : !data || data.matrix.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No projects have been created yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Begin by creating a construction project, adding project sites, and assigning operations supervisors.
              </p>
            </div>
            <Link to="/admin/projects/new">
              <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} className="bg-[#12141a] text-white">
                Create First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.matrix.map((proj) => (
              <div
                key={proj.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4"
              >
                {/* Project Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#12141a] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{proj.projectName}</h3>
                        <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {proj.projectCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Status: {proj.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/admin/projects/${proj.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        Project Details &amp; Supervisors
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Assigned Supervisors Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 mr-1">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    Assigned Supervisors:
                  </span>
                  {proj.supervisors.length === 0 ? (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium">
                      No supervisor assigned (Project requires assignment)
                    </span>
                  ) : (
                    proj.supervisors.map((s) => (
                      <span
                        key={s.id || s._id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/60 font-semibold"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        {s.fullName} ({s.email})
                      </span>
                    ))
                  )}
                </div>

                {/* Sites and Inspectors Table */}
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-100/60 border-b border-slate-200/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
                    <span>Sites Under Project ({proj.sites.length})</span>
                    <Link to={`/admin/sites/new`} className="text-[11px] text-blue-600 hover:underline">
                      + Add Site
                    </Link>
                  </div>

                  {proj.sites.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No construction sites have been created for this project yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {proj.sites.map((site) => (
                        <div key={site.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-800">{site.siteName}</span>
                              <span className="ml-2 font-mono text-[10px] text-slate-400">({site.siteCode})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-500 font-medium text-[11px]">Inspectors:</span>
                            {site.assignedInspectors.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">None assigned</span>
                            ) : (
                              site.assignedInspectors.map((ai) => (
                                <span
                                  key={ai.assignmentId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
                                  title={`Assigned by: ${ai.supervisor?.fullName || 'Supervisor'}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  {ai.inspector?.fullName || 'Field Inspector'}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
