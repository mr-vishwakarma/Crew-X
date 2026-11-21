import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { projectService } from '../../../services/project.service';
import type { Project, ProjectPriority, ProjectStatus } from '../../../types/project.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import {
  Building2,
  Plus,
  Search,
  Calendar,
  MapPin,
  Layers,
  ChevronRight,
  Edit2,
  Archive,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PLANNED: 'bg-blue-50 text-blue-700 border-blue-200',
  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const PRIORITY_BADGE_CLASSES: Record<ProjectPriority, string> = {
  LOW: 'bg-slate-50 text-slate-600 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-600 border-blue-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200 font-bold',
};

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Archive modal state
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await projectService.getProjects({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        page,
        limit: 10,
      });
      setProjects(response.projects);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.total);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to fetch projects'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, priorityFilter, page]);

  const handleArchive = async (force = false) => {
    if (!projectToArchive) return;
    setIsArchiving(true);
    setArchiveError(null);
    try {
      await projectService.archiveProject(projectToArchive.id || (projectToArchive as any)._id, force);
      setProjectToArchive(null);
      fetchProjects();
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : 'Failed to archive project'
      );
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <AuthenticatedLayout
      title="Projects Management"
      subtitle="Configure capital development, infrastructure contracts, and geographic site portfolios."
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Projects Directory</h2>
              <p className="text-xs text-slate-500">
                {totalCount} total project{totalCount === 1 ? '' : 's'} managed under organization
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate('/admin/projects/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <Alert type="error" title="Error Loading Projects" message={errorMessage} />
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search projects by name, code, or client..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                aria-label="Filter by Priority"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Listing */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading project records...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <FolderOpen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Projects Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No projects match your filter criteria. Try clearing search or filters.'
                  : 'Get started by creating the first infrastructure or civil project for your organization.'}
              </p>
            </div>
            {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL') ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/projects/new')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/90 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Project & Code</th>
                    <th className="px-6 py-4">Client / Lead</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Timeline</th>
                    <th className="px-6 py-4 text-center">Sites</th>
                    <th className="px-6 py-4">Status & Priority</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((proj) => {
                    const id = proj.id || (proj as any)._id;
                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/admin/projects/${id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {proj.projectName}
                          </div>
                          <div className="text-xs font-mono font-medium text-slate-500">
                            {proj.projectCode}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium">
                            {proj.clientName || 'Direct Internal Project'}
                          </div>
                          {proj.projectManager && (
                            <div className="text-xs text-slate-500">
                              PM: {proj.projectManager}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {proj.location || 'Not specified'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>
                              {new Date(proj.startDate).toLocaleDateString()} –{' '}
                              {new Date(proj.expectedEndDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                            <Layers className="h-3 w-3" />
                            {proj.siteCount ?? 0}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                STATUS_BADGE_CLASSES[proj.status] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {proj.status.replace('_', ' ')}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                PRIORITY_BADGE_CLASSES[proj.priority] || 'bg-slate-50 text-slate-600'
                              }`}
                            >
                              {proj.priority} PRIORITY
                            </span>
                          </div>
                        </td>

                        <td
                          className="px-6 py-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/projects/${id}`)}
                              title="View Project Details"
                              className="px-2 py-1"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/projects/${id}/edit`)}
                              title="Edit Project"
                              className="px-2 py-1"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setArchiveError(null);
                                setProjectToArchive(proj);
                              }}
                              title="Archive Project"
                              className="px-2 py-1 hover:border-red-200 hover:text-red-600"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing page <span className="font-semibold text-slate-700">{page}</span> of{' '}
                  <span className="font-semibold text-slate-700">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Archive Confirmation Modal */}
        <Modal
          isOpen={!!projectToArchive}
          onClose={() => setProjectToArchive(null)}
          title="Archive Project"
          description="Are you sure you want to archive this project?"
        >
          <div className="space-y-4">
            {archiveError && (
              <Alert type="error" title="Cannot Archive" message={archiveError} />
            )}

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">
                  Safely archiving "{projectToArchive?.projectName}"
                </p>
                <p>
                  Archiving hides the project from active inspection workflows but retains all historical audit logs, defect records, and site compliance reports.
                </p>
                {projectToArchive?.siteCount ? (
                  <p className="mt-2 font-semibold text-amber-900">
                    Note: This project currently has {projectToArchive.siteCount} associated site(s).
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setProjectToArchive(null)}
                disabled={isArchiving}
              >
                Cancel
              </Button>
              {archiveError && (
                <Button
                  variant="outline"
                  onClick={() => handleArchive(true)}
                  disabled={isArchiving}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Force Archive
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => handleArchive(false)}
                isLoading={isArchiving}
              >
                Confirm Archive
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
};
