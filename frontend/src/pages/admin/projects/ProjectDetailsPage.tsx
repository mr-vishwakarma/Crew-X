import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { projectService } from '../../../services/project.service';
import type { Project, ProjectStatus, ProjectPriority, SupervisorSummary } from '../../../types/project.types';
import type { Site } from '../../../types/site.types';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Layers,
  Edit2,
  Archive,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Check,
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

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Tab: 'overview' | 'sites' | 'supervisors'
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'supervisors'>('overview');

  // Archive modal
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  // Supervisor assignment modal
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(false);
  const [assignedSupervisors, setAssignedSupervisors] = useState<SupervisorSummary[]>([]);
  const [availableSupervisors, setAvailableSupervisors] = useState<SupervisorSummary[]>([]);
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<Set<string>>(new Set());
  const [isSavingSupervisors, setIsSavingSupervisors] = useState(false);
  const [supervisorModalError, setSupervisorModalError] = useState<string | null>(null);

  const fetchProjectDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await projectService.getProject(id);
      setProject(data.project);
      setSites(data.sites);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load project details'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleArchive = async (force = false) => {
    if (!id) return;
    setIsArchiving(true);
    setArchiveError(null);
    try {
      await projectService.archiveProject(id, force);
      setIsArchiveModalOpen(false);
      navigate('/admin/projects');
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : 'Failed to archive project'
      );
    } finally {
      setIsArchiving(false);
    }
  };

  const openSupervisorModal = async () => {
    if (!id) return;
    setIsSupervisorModalOpen(true);
    setIsLoadingSupervisors(true);
    setSupervisorModalError(null);
    try {
      const data = await projectService.getProjectSupervisors(id);
      setAssignedSupervisors(data.assigned);
      setAvailableSupervisors(data.available);

      const initialSelected = new Set(
        data.assigned.map((s) => s.id || (s as any)._id)
      );
      setSelectedSupervisorIds(initialSelected);
    } catch (err) {
      setSupervisorModalError(
        err instanceof Error ? err.message : 'Failed to fetch supervisors'
      );
    } finally {
      setIsLoadingSupervisors(false);
    }
  };

  const toggleSupervisorSelection = (supId: string) => {
    const updated = new Set(selectedSupervisorIds);
    if (updated.has(supId)) {
      updated.delete(supId);
    } else {
      updated.add(supId);
    }
    setSelectedSupervisorIds(updated);
  };

  const handleSaveSupervisors = async () => {
    if (!id) return;
    setIsSavingSupervisors(true);
    setSupervisorModalError(null);
    try {
      await projectService.assignProjectSupervisors(id, Array.from(selectedSupervisorIds));
      setIsSupervisorModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      setSupervisorModalError(
        err instanceof Error ? err.message : 'Failed to update supervisor assignments'
      );
    } finally {
      setIsSavingSupervisors(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout title="Project Details">
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading project details...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (errorMessage || !project) {
    return (
      <AuthenticatedLayout title="Project Details">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects Directory
          </Link>
          <Alert
            type="error"
            title="Error Loading Project"
            message={errorMessage || 'Project record not found or inaccessible.'}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  const projectId = project.id || (project as any)._id;

  return (
    <AuthenticatedLayout
      title={project.projectName}
      subtitle={`Project Code: ${project.projectCode} • ${project.industry || 'Civil Infrastructure'}`}
    >
      <div className="space-y-6">
        {/* Top Navigation & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects Directory
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/projects/${projectId}/edit`)}
              className="gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Project
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setArchiveError(null);
                setIsArchiveModalOpen(true);
              }}
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          </div>
        </div>

        {/* Project Header Summary Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_BADGE_CLASSES[project.status]
                  }`}
                >
                  {project.status.replace('_', ' ')}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    PRIORITY_BADGE_CLASSES[project.priority]
                  }`}
                >
                  {project.priority} PRIORITY
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {project.projectCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.projectName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                {project.description || 'No detailed scope description provided.'}
              </p>
            </div>

            <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
              <Button
                variant="primary"
                onClick={() => navigate(`/admin/sites/new?projectId=${projectId}`)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Site to Project
              </Button>
            </div>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Layers className="h-3.5 w-3.5 text-blue-600" />
                Physical Sites
              </div>
              <div className="text-xl font-bold text-slate-900">{sites.length}</div>
              <div className="text-[11px] text-slate-400">
                {sites.filter((s) => s.status === 'ACTIVE').length} active sites
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-indigo-600" />
                Supervisors Assigned
              </div>
              <div className="text-xl font-bold text-slate-900">
                {project.assignedSupervisors?.length || 0}
              </div>
              <div className="text-[11px] text-slate-400">Operations oversight</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                Start Date
              </div>
              <div className="text-sm font-bold text-slate-900">
                {new Date(project.startDate).toLocaleDateString()}
              </div>
              <div className="text-[11px] text-slate-400">Commencement</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Target Completion
              </div>
              <div className="text-sm font-bold text-slate-900">
                {new Date(project.expectedEndDate).toLocaleDateString()}
              </div>
              <div className="text-[11px] text-slate-400">Target milestone</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Project Overview
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'sites'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Associated Sites
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-bold">
                {sites.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('supervisors')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'supervisors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Assigned Supervisors
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-bold">
                {project.assignedSupervisors?.length || 0}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Contract & Governance Info
              </h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Client Organization</dt>
                  <dd className="font-semibold text-slate-900">{project.clientName || 'Internal Capital Work'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Project Manager</dt>
                  <dd className="font-semibold text-slate-900">{project.projectManager || 'Unassigned'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Industry Sector</dt>
                  <dd className="font-semibold text-slate-900">{project.industry || 'Infrastructure'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Geographic Location</dt>
                  <dd className="font-semibold text-slate-900 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {project.location || 'Not specified'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Milestones & Timeline Progress
              </h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Commencement Date</dt>
                  <dd className="font-semibold text-slate-900">
                    {new Date(project.startDate).toLocaleDateString()}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Expected Handover Date</dt>
                  <dd className="font-semibold text-slate-900">
                    {new Date(project.expectedEndDate).toLocaleDateString()}
                  </dd>
                </div>
                {project.actualEndDate && (
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-slate-500">Actual Completion Date</dt>
                    <dd className="font-semibold text-slate-900">
                      {new Date(project.actualEndDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Created In System</dt>
                  <dd className="font-semibold text-slate-900">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Tab 2: Associated Sites */}
        {activeTab === 'sites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Physical Inspection Sites</h3>
                <p className="text-xs text-slate-500">
                  Physical construction facilities, fabrication yards, and work zones attached to this project.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/admin/sites/new?projectId=${projectId}`)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Site
              </Button>
            </div>

            {sites.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
                  <Layers className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No Sites Associated Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Define the physical sites, construction sectors, or plant yards for this project.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/admin/sites/new?projectId=${projectId}`)}
                  className="gap-1.5 mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Site
                </Button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Site Name & Code</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Address / Coordinates</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sites.map((site) => {
                      const siteId = site.id || (site as any)._id;
                      return (
                        <tr
                          key={siteId}
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          onClick={() => navigate(`/admin/sites/${siteId}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                              {site.siteName}
                            </div>
                            <div className="text-xs font-mono font-medium text-slate-500">
                              {site.siteCode}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                              {site.siteType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <div>{site.address}</div>
                            {site.city && <div className="text-slate-400">{site.city}, {site.state}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                site.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {site.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/sites/${siteId}`)}
                              className="px-2 py-1"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Assigned Supervisors */}
        {activeTab === 'supervisors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Operations Supervisors</h3>
                <p className="text-xs text-slate-500">
                  Supervisors authorized to manage checklists, audit logs, and inspector teams on this project.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={openSupervisorModal}
                className="gap-1.5"
              >
                <UserCheck className="h-4 w-4" />
                Manage Supervisors
              </Button>
            </div>

            {(!project.assignedSupervisors || project.assignedSupervisors.length === 0) ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No Supervisors Assigned</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Assign operations supervisors to delegate field oversight and review inspection filings.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openSupervisorModal}
                  className="gap-1.5 mt-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Assign Supervisors
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.assignedSupervisors.map((sup) => (
                  <div
                    key={sup.id || (sup as any)._id}
                    className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex items-center gap-3.5"
                  >
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {sup.fullName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{sup.fullName}</h4>
                      <p className="text-xs text-slate-500 truncate">{sup.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        SUPERVISOR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supervisor Assignment Modal */}
        <Modal
          isOpen={isSupervisorModalOpen}
          onClose={() => setIsSupervisorModalOpen(false)}
          title="Manage Project Supervisors"
          description={`Assign or unassign supervisors for "${project.projectName}"`}
        >
          <div className="space-y-4">
            {supervisorModalError && (
              <Alert type="error" title="Assignment Error" message={supervisorModalError} />
            )}

            {isLoadingSupervisors ? (
              <div className="py-8 text-center">
                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading organization supervisors...</p>
              </div>
            ) : availableSupervisors.length === 0 && assignedSupervisors.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No active supervisor accounts found in this organization.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {/* List combined unique supervisors */}
                {Array.from(
                  new Map(
                    [...assignedSupervisors, ...availableSupervisors].map((item) => [
                      item.id || (item as any)._id,
                      item,
                    ])
                  ).values()
                ).map((sup) => {
                  const supId = sup.id || (sup as any)._id;
                  const isChecked = selectedSupervisorIds.has(supId);
                  return (
                    <label
                      key={supId}
                      onClick={() => toggleSupervisorSelection(supId)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/70 border-blue-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{sup.fullName}</p>
                          <p className="text-xs text-slate-500">{sup.email}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">SUPERVISOR</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setIsSupervisorModalOpen(false)}
                disabled={isSavingSupervisors}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSupervisors}
                isLoading={isSavingSupervisors}
              >
                Save Assignments
              </Button>
            </div>
          </div>
        </Modal>

        {/* Archive Project Modal */}
        <Modal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          title="Archive Project"
          description="Are you sure you want to archive this project?"
        >
          <div className="space-y-4">
            {archiveError && (
              <Alert type="error" title="Cannot Archive" message={archiveError} />
            )}

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">
                  Safely archiving "{project.projectName}"
                </p>
                <p>
                  Archiving removes the project from active operations while safeguarding all historical inspections, site registries, and evidence documents.
                </p>
                {sites.length > 0 && (
                  <p className="mt-2 font-semibold text-amber-900">
                    Warning: There are {sites.length} site(s) currently linked to this project.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsArchiveModalOpen(false)}
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
