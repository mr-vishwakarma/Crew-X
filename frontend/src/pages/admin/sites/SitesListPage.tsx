import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { siteService } from '../../../services/site.service';
import { projectService } from '../../../services/project.service';
import type { Site, SiteStatus, SiteType } from '../../../types/site.types';
import type { Project } from '../../../types/project.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import {
  MapPin,
  Plus,
  Search,
  ChevronRight,
  Edit2,
  Archive,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  Compass,
} from 'lucide-react';

const STATUS_BADGE_CLASSES: Record<SiteStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-700 border-slate-200',
  UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
};

const SITE_TYPE_LABELS: Record<SiteType, string> = {
  CONSTRUCTION: 'Construction Zone',
  MANUFACTURING: 'Manufacturing Plant',
  AGRICULTURE: 'Agricultural Area',
  INFRASTRUCTURE: 'Civil Infrastructure',
  WAREHOUSE: 'Logistics Warehouse',
  OTHER: 'Special Facility',
};

export const SitesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sites, setSites] = useState<Site[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>(
    searchParams.get('projectId') || 'ALL'
  );
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Archive modal
  const [siteToArchive, setSiteToArchive] = useState<Site | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  // Load projects for filter dropdown
  useEffect(() => {
    const loadProjectsDropdown = async () => {
      try {
        const res = await projectService.getProjects({ limit: 100 });
        setProjectsList(res.projects);
      } catch {
        // Non-blocking
      }
    };
    loadProjectsDropdown();
  }, []);

  const fetchSites = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await siteService.getSites({
        search: search.trim() || undefined,
        projectId: projectFilter !== 'ALL' ? projectFilter : undefined,
        siteType: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        limit: 10,
      });
      setSites(response.sites);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.total);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to fetch sites'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [search, projectFilter, typeFilter, statusFilter, page]);

  const handleArchive = async () => {
    if (!siteToArchive) return;
    setIsArchiving(true);
    setArchiveError(null);
    try {
      await siteService.archiveSite(siteToArchive.id || (siteToArchive as any)._id);
      setSiteToArchive(null);
      fetchSites();
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : 'Failed to archive site'
      );
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <AuthenticatedLayout
      title="Sites & Facilities"
      subtitle="Manage geographical construction zones, production plants, and inspection boundaries."
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sites Directory</h2>
              <p className="text-xs text-slate-500">
                {totalCount} physical site{totalCount === 1 ? '' : 's'} mapped across active projects
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() =>
              navigate(
                projectFilter !== 'ALL'
                  ? `/admin/sites/new?projectId=${projectFilter}`
                  : '/admin/sites/new'
              )
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Site
          </Button>
        </div>

        {errorMessage && (
          <Alert type="error" title="Error Loading Sites" message={errorMessage} />
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by site name, code, or city..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Filter by Project */}
            <div>
              <select
                aria-label="Filter by Project"
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
              >
                <option value="ALL">All Projects</option>
                {projectsList.map((p) => {
                  const pId = p.id || (p as any)._id;
                  return (
                    <option key={pId} value={pId}>
                      {p.projectName} ({p.projectCode})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter by Site Type */}
            <div>
              <select
                aria-label="Filter by Site Type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all"
              >
                <option value="ALL">All Facility Types</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="INFRASTRUCTURE">Civil Infrastructure</option>
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="AGRICULTURE">Agriculture</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Filter by Status */}
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sites Listing */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading site records...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <FolderOpen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Sites Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {search || projectFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No sites match your selected filters. Try broadening your criteria.'
                  : 'Start by mapping physical work sites and facilities to your projects.'}
              </p>
            </div>
            {(search || projectFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL') ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setProjectFilter('ALL');
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/sites/new')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Site
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/90 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Site Name & Code</th>
                    <th className="px-6 py-4">Associated Project</th>
                    <th className="px-6 py-4">Facility Type</th>
                    <th className="px-6 py-4">Address / Coordinates</th>
                    <th className="px-6 py-4">Site Lead</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sites.map((site) => {
                    const id = site.id || (site as any)._id;
                    const projectObj =
                      typeof site.projectId === 'object' && site.projectId !== null
                        ? site.projectId
                        : null;

                    return (
                      <tr
                        key={id}
                        className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/admin/sites/${id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {site.siteName}
                          </div>
                          <div className="text-xs font-mono font-medium text-slate-500">
                            {site.siteCode}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {projectObj ? (
                            <div>
                              <div className="text-slate-900 font-semibold text-xs">
                                {projectObj.projectName}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">
                                {projectObj.projectCode}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Project reference</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {SITE_TYPE_LABELS[site.siteType] || site.siteType}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-600">
                            <div className="truncate max-w-[180px]">{site.address}</div>
                            {site.city && (
                              <div className="text-slate-400">
                                {site.city}, {site.state}
                              </div>
                            )}
                          </div>
                          {site.latitude != null && site.longitude != null && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-600 mt-0.5">
                              <Compass className="h-3 w-3" />
                              {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-700">
                          {site.siteManager || <span className="text-slate-400">Unassigned</span>}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              STATUS_BADGE_CLASSES[site.status] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {site.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td
                          className="px-6 py-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/sites/${id}`)}
                              title="View Site Details"
                              className="px-2 py-1"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/sites/${id}/edit`)}
                              title="Edit Site"
                              className="px-2 py-1"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setArchiveError(null);
                                setSiteToArchive(site);
                              }}
                              title="Archive Site"
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
          isOpen={!!siteToArchive}
          onClose={() => setSiteToArchive(null)}
          title="Archive Site"
          description="Are you sure you want to archive this site?"
        >
          <div className="space-y-4">
            {archiveError && (
              <Alert type="error" title="Cannot Archive" message={archiveError} />
            )}

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">
                  Safely archiving "{siteToArchive?.siteName}"
                </p>
                <p>
                  Archiving hides the site from new field inspection assignments while preserving all historical inspection records, photos, and compliance logs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSiteToArchive(null)}
                disabled={isArchiving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleArchive}
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
