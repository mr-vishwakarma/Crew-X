import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { assignmentService } from '../../../services/assignment.service';
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
  ClipboardList,
  MapPin,
  Building2,
  Clock,
  RefreshCw,
  FileCheck2,
  Play,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface InspectionTask {
  id: string;
  code: string;
  title: string;
  projectName: string;
  siteName: string;
  location: string;
  checklistType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  status: string;
  isOfflineReady: boolean;
  instructions: string;
  siteId?: string;
}

export const InspectorMyInspectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<InspectionTask[]>([]);
  const [downloadedMap, setDownloadedMap] = useState<Map<string, DownloadedAssignment>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchInspections = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [remoteTasks, localDownloads] = await Promise.all([
        assignmentService.getInspectorMyAssignments(),
        getDownloadedAssignments(user?.id),
      ]);

      setTasks(remoteTasks);

      const dMap = new Map<string, DownloadedAssignment>();
      localDownloads.forEach((d) => dMap.set(d.id, d));
      setDownloadedMap(dMap);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to retrieve inspections');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Download a single assignment for offline work
  const handleDownloadOffline = async (task: InspectionTask) => {
    setDownloadingId(task.id);
    try {
      const assignment: DownloadedAssignment = {
        id: task.id,
        siteId: task.siteId || `site_${task.id}`,
        siteName: task.siteName,
        siteCode: task.code,
        projectName: task.projectName,
        location: task.location,
        checklistType: task.checklistType,
        priority: task.priority,
        dueDate: task.dueDate,
        instructions: task.instructions,
        inspectorId: user?.id || 'unknown',
        organizationId: user?.organizationId || 'unknown',
        downloadedAt: new Date().toISOString(),
        isAvailableOffline: true,
      };

      await saveDownloadedAssignment(assignment);

      // Pre-initialize local inspection draft in Dexie if not existing
      await saveLocalInspection({
        id: task.id,
        assignmentId: task.id,
        siteId: assignment.siteId,
        siteName: task.siteName,
        projectName: task.projectName,
        templateName: task.checklistType,
        inspectorId: user?.id,
        organizationId: user?.organizationId,
        syncStatus: 'draft',
        workflowStatus: 'DRAFT',
      });

      setDownloadedMap((prev) => new Map(prev).set(task.id, assignment));
    } catch (err: any) {
      console.error('Failed to download assignment for offline:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Download all assignments for offline work
  const handleDownloadAll = async () => {
    setIsLoading(true);
    try {
      for (const task of tasks) {
        await handleDownloadOffline(task);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <AuthenticatedLayout
      title="My Inspections"
      subtitle="View, launch, download and complete field compliance audits"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Inspection Work Orders ({tasks.length})
            </h2>
            <p className="text-xs text-slate-500">
              Audits assigned to you by your project supervisor • {downloadedMap.size} available offline
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tasks.length > 0 && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<Download className="h-3.5 w-3.5 text-blue-600" />}
                onClick={handleDownloadAll}
                className="text-xs font-semibold"
              >
                Download All for Offline
              </Button>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              <option value="ALL">All Tasks</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={fetchInspections}
            >
              Refresh
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert type="error" title="Failed to Load Inspections" message={errorMessage} />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
            <RefreshCw className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading assigned inspections...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No inspection assignments yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                You have no scheduled inspections assigned to you at this time. Contact your Supervisor for new work orders.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTasks.map((task) => {
              const isDownloaded = downloadedMap.has(task.id);
              const isDownloading = downloadingId === task.id;

              return (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {task.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {task.priority} Priority
                        </span>
                        {isDownloaded && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Offline Ready
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {task.projectName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {task.siteName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {task.instructions && (
                        <p className="text-[11px] text-slate-600 mt-1.5 italic bg-slate-50 p-1.5 rounded">
                          "{task.instructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!isDownloaded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadOffline(task)}
                        disabled={isDownloading}
                        leftIcon={<Download className="h-3.5 w-3.5 text-blue-600" />}
                        className="text-xs"
                      >
                        {isDownloading ? 'Saving...' : 'Save Offline'}
                      </Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        In IndexedDB
                      </span>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/inspector/checklist/${task.id}`)}
                      leftIcon={<Play className="h-3.5 w-3.5 fill-current" />}
                      className="bg-[#12141a] text-white"
                    >
                      Start Checklist
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
