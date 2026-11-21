import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { assignmentService } from '../../../services/assignment.service';
import type { SupervisorProject } from '../../../types/assignment.types';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  Building2,
  MapPin,
  Users,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export const SupervisorProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<SupervisorProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await assignmentService.getSupervisorProjects();
      setProjects(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve assigned projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <AuthenticatedLayout
      title="My Assigned Projects"
      subtitle="View progress, facility sites, and inspector resource allocation for your authorized project scope"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Authorized Projects ({projects.length})
            </h2>
            <p className="text-xs text-slate-500">
              Projects delegated to your supervisory jurisdiction by the system administrator
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchProjects}
          >
            Refresh Projects
          </Button>
        </div>

        {errorMessage && (
          <Alert type="error" title="Error Loading Projects" message={errorMessage} />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading authorized projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No projects assigned yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                You have not been assigned to any projects yet. Please contact your Administrator to assign you to active projects.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-[#12141a] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          {proj.projectName}
                        </h3>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {proj.projectCode}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {proj.status}
                    </span>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{proj.description}</p>
                  )}

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{proj.sitesCount} Sites</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{proj.activeInspectorsCount} Inspectors</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {proj.industry || 'Civil Infrastructure'}
                  </span>
                  <Link to={`/supervisor/sites?projectId=${proj.id}`}>
                    <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                      View Sites &amp; Staffing
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
