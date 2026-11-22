import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { assignmentService } from '../../../services/assignment.service';
import type { InspectorAssignedSite } from '../../../types/assignment.types';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import {
  saveDownloadedAssignment,
  getDownloadedAssignments,
  saveLocalInspection,
} from '../../../database/databaseHelpers';
import type { DownloadedAssignment } from '../../../database/schema';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  MapPin,
  Building2,
  UserCheck,
  RefreshCw,
  Compass,
  Download,
  CheckCircle2,
  Play,
} from 'lucide-react';

export const InspectorMySitesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sites, setSites] = useState<InspectorAssignedSite[]>([]);
  const [downloadedSiteIds, setDownloadedSiteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [data, localDownloads] = await Promise.all([
        assignmentService.getInspectorMySites(),
        getDownloadedAssignments(user?.id),
      ]);
      setSites(data);

      const dIds = new Set<string>();
      localDownloads.forEach((d) => dIds.add(d.siteId));
      setDownloadedSiteIds(dIds);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve assigned sites');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handleDownloadSiteOffline = async (item: InspectorAssignedSite) => {
    setDownloadingId(item.assignmentId);
    try {
      const assignment: DownloadedAssignment = {
        id: item.assignmentId,
        siteId: item.site.id,
        siteName: item.site.siteName,
        siteCode: item.site.siteCode,
        projectName: item.project?.projectName || 'Project',
        projectCode: item.project?.projectCode,
        location: `${item.site.address}, ${item.site.city || ''}`,
        checklistType: 'ISO-9001 Construction & Safety Audit',
        priority: 'MEDIUM',
        dueDate: item.endDate || new Date().toISOString(),
        instructions: item.instructions,
        inspectorId: user?.id || 'unknown',
        organizationId: user?.organizationId || 'unknown',
        downloadedAt: new Date().toISOString(),
        isAvailableOffline: true,
      };

      await saveDownloadedAssignment(assignment);

      // Pre-initialize local draft
      await saveLocalInspection({
        id: item.assignmentId,
        assignmentId: item.assignmentId,
        siteId: item.site.id,
        siteName: item.site.siteName,
        projectName: item.project?.projectName || 'Project',
        templateName: 'ISO-9001 Construction & Safety Audit',
        inspectorId: user?.id,
        organizationId: user?.organizationId,
        syncStatus: 'draft',
        workflowStatus: 'DRAFT',
      });

      setDownloadedSiteIds((prev) => new Set(prev).add(item.site.id));
    } catch (err: any) {
      console.error('Failed to download site for offline:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <AuthenticatedLayout
      title="My Assigned Sites"
      subtitle="Authorized construction facilities and field zones where you are permitted to perform inspections"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assigned Sites ({sites.length})
            </h2>
            <p className="text-xs text-slate-500">
              Site credentials granted by your assigned project supervisor • {downloadedSiteIds.size} saved offline
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchSites}
          >
            Refresh My Sites
          </Button>
        </div>

        {errorMessage && (
          <Alert type="error" title="Failed to Load Assigned Sites" message={errorMessage} />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading your permitted sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <MapPin className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No site assignments yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                You have not been assigned to any project sites yet. Please contact your Supervisor to dispatch you to an active site.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sites.map((item) => {
              const isDownloaded = downloadedSiteIds.has(item.site.id);
              const isDownloading = downloadingId === item.assignmentId;

              return (
                <div
                  key={item.assignmentId}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-[#12141a] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {item.site.siteName}
                          </h3>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.site.siteCode}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isDownloaded && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Offline
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.site.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <p className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">Project:</span>
                        <span className="truncate">{item.project?.projectName || 'Project'}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.site.address} {item.site.city ? `, ${item.site.city}` : ''}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-700">Supervisor:</span>
                        <span>{item.assigningSupervisor?.fullName || 'Assigned Supervisor'}</span>
                      </p>
                    </div>

                    {item.instructions && (
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs text-slate-600">
                        <span className="font-bold text-[11px] text-slate-700 block mb-0.5">
                          Instructions:
                        </span>
                        <p className="italic">"{item.instructions}"</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {!isDownloaded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSiteOffline(item)}
                        disabled={isDownloading}
                        leftIcon={<Download className="w-3.5 h-3.5 text-blue-600" />}
                        className="text-xs"
                      >
                        {isDownloading ? 'Saving...' : 'Save Offline'}
                      </Button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700">Ready Offline</span>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/inspector/checklist/${item.assignmentId}`)}
                      leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                      className="text-xs font-bold"
                    >
                      Start Audit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
