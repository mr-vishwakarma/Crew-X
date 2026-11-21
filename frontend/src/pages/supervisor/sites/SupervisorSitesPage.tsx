import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { assignmentService } from '../../../services/assignment.service';
import type {
  SupervisorSite,
  AvailableUserItem,
} from '../../../types/assignment.types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import {
  MapPin,
  Building2,
  Users,
  Plus,
  RefreshCw,
  Mail,
} from 'lucide-react';

export const SupervisorSitesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('projectId') || undefined;

  const [sites, setSites] = useState<SupervisorSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Assign Inspector Modal State
  const [selectedSite, setSelectedSite] = useState<SupervisorSite | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLoadingInspectors, setIsLoadingInspectors] = useState(false);
  const [availableInspectors, setAvailableInspectors] = useState<AvailableUserItem[]>([]);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSites = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await assignmentService.getSupervisorSites(projectFilter);
      setSites(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve project sites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [projectFilter]);

  const handleOpenAssignModal = async (site: SupervisorSite) => {
    setSelectedSite(site);
    setIsAssignModalOpen(true);
    setIsLoadingInspectors(true);
    setModalError(null);
    setSelectedInspectorId('');
    setInstructions('');
    try {
      const res = await assignmentService.getSiteInspectors(site.id);
      setAvailableInspectors(res.available);
      if (res.available.length > 0) {
        setSelectedInspectorId(res.available[0].id);
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to retrieve available inspectors');
    } finally {
      setIsLoadingInspectors(false);
    }
  };

  const handleAssignInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite || !selectedInspectorId) return;

    setIsSubmittingAssignment(true);
    setModalError(null);
    try {
      await assignmentService.assignInspectorToSite(selectedSite.id, {
        inspectorId: selectedInspectorId,
        instructions: instructions.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setIsAssignModalOpen(false);
      fetchSites();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to assign inspector');
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const handleRevokeInspector = async (siteId: string, assignmentId: string) => {
    if (!confirm('Are you sure you want to revoke this inspector from this site? Historical inspection records will be preserved.')) {
      return;
    }

    setRevokingId(assignmentId);
    try {
      await assignmentService.revokeInspectorFromSite(siteId, assignmentId);
      fetchSites();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to revoke inspector');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <AuthenticatedLayout
      title="Project Sites & Inspector Staffing"
      subtitle="Supervise active site zones and dispatch credentialed field inspectors to specific site packages"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assigned Project Sites ({sites.length})
            </h2>
            <p className="text-xs text-slate-500">
              {projectFilter ? 'Filtered by selected project' : 'All construction sites under your supervisory jurisdiction'}
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchSites}
          >
            Refresh Sites
          </Button>
        </div>

        {errorMessage && (
          <Alert type="error" title="Failed to Load Sites" message={errorMessage} />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading authorized sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <MapPin className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No sites available in your assigned scope</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Your assigned projects do not currently have any active sites. Contact your Administrator to provision sites under your project.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4"
              >
                {/* Site Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-200/60 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-0.5">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{site.siteName}</h3>
                        <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {site.siteCode}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {site.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        <span className="font-medium text-slate-700">Project:</span>
                        <span>{site.project?.projectName || 'Project'}</span>
                        <span className="text-slate-300">•</span>
                        <span>{site.address} {site.city ? `, ${site.city}` : ''}</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => handleOpenAssignModal(site)}
                    className="bg-[#12141a] text-white shrink-0"
                  >
                    Assign Inspector
                  </Button>
                </div>

                {/* Assigned Inspectors Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      Active Inspectors on Site ({site.assignedInspectors.length}):
                    </span>
                  </div>

                  {site.assignedInspectors.length === 0 ? (
                    <div className="p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                      No inspectors are currently assigned to this site. Click <strong>"Assign Inspector"</strong> above to assign a team member.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {site.assignedInspectors.map((item) => (
                        <div
                          key={item.assignmentId}
                          className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 flex flex-col justify-between space-y-2 text-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 block truncate">
                                {item.inspector?.fullName || 'Inspector'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                ACTIVE
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {item.inspector?.email || '—'}
                            </span>
                            {item.instructions && (
                              <p className="text-[11px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-200/60 mt-1.5 line-clamp-2">
                                "{item.instructions}"
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Assigned {new Date(item.assignedAt).toLocaleDateString()}</span>
                            <button
                              type="button"
                              disabled={revokingId === item.assignmentId}
                              onClick={() => handleRevokeInspector(site.id, item.assignmentId)}
                              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                            >
                              {revokingId === item.assignmentId ? 'Revoking...' : 'Revoke'}
                            </button>
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

        {/* Assign Inspector Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Inspector to ${selectedSite?.siteName || 'Site'}`}
        >
          <form onSubmit={handleAssignInspector} className="space-y-4">
            {modalError && (
              <Alert type="error" title="Assignment Failed" message={modalError} />
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Available Inspector *
              </label>
              {isLoadingInspectors ? (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  Loading available inspectors in organization...
                </div>
              ) : availableInspectors.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  All active inspectors in the organization are already assigned to this site, or no inspector accounts exist.
                </div>
              ) : (
                <select
                  required
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                >
                  {availableInspectors.map((insp) => (
                    <option key={insp.id} value={insp.id}>
                      {insp.fullName} ({insp.email}) {insp.employeeId ? `[${insp.employeeId}]` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date (optional)
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Completion Date (optional)
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Instructions &amp; Responsibilities (optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Focus on Pier 14 rebar spacing and concrete slump sampling"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Site-Level Access Grant:</span>
              <p>
                Confirming assignment authorizes this inspector to view site coordinates, checklist forms, and submit audit logs for this site on their mobile/desktop dashboard.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsAssignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmittingAssignment || availableInspectors.length === 0}
                className="bg-[#12141a] text-white"
              >
                {isSubmittingAssignment ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
};
