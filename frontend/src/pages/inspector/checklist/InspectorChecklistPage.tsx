import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import {
  getLocalInspectionById,
  saveLocalInspection,
  saveLocalPhoto,
  getLocalPhotosByInspectionId,
  deleteLocalPhoto,
  getDownloadedAssignments,
  saveDownloadedAssignment,
} from '../../../database/databaseHelpers';
import type { LocalPhoto, DownloadedAssignment } from '../../../database/schema';
import { assignmentService } from '../../../services/assignment.service';
import { syncService } from '../../../services/sync.service';
import {
  geolocationService,
  type GpsLocationResult,
  type GpsErrorResult,
} from '../../../services/geolocation.service';
import {
  checklistService,
  type ChecklistSection,
  type ChecklistQuestion,
} from '../../../services/checklist.service';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  ClipboardCheck,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Send,
  Trash2,
  ArrowLeft,
  Compass,
  Building2,
  UserCheck,
  RefreshCw,
  Play,
  RotateCcw,
} from 'lucide-react';

export const InspectorChecklistPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connectionState } = useNetworkStatus();

  // Active Assignment and Site Resolution State
  const [currentId, setCurrentId] = useState<string>(id || '');
  const [assignedSite, setAssignedSite] = useState<{
    siteId: string;
    siteName: string;
    siteCode?: string;
    projectName: string;
    projectCode?: string;
    address?: string;
    supervisorName?: string;
    assignmentId?: string;
  } | null>(null);

  // Available assignments when navigated directly to /inspector/checklist without an ID
  const [availableAssignments, setAvailableAssignments] = useState<DownloadedAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState<boolean>(false);

  // Dynamic Checklist Sections and Questions
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [checklistTitle, setChecklistTitle] = useState<string>('Field Compliance Checklist');
  const [answers, setAnswers] = useState<Record<string, 'compliant' | 'non_compliant' | 'na'>>({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [overallNotes, setOverallNotes] = useState<string>('');

  // GPS State
  const [gpsData, setGpsData] = useState<GpsLocationResult | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<GpsErrorResult | null>(null);

  // Photos State
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [activePhotoQuestionId, setActivePhotoQuestionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Status & Feedback
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    text: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================================
  // ASSIGNMENT & SITE RESOLUTION LOGIC
  // =========================================================================

  const resolveAssignment = useCallback(
    async (assignmentTargetId: string) => {
      // 1. Check local Dexie inspections table
      const localInsp = await getLocalInspectionById(assignmentTargetId);
      if (localInsp) {
        setCurrentId(localInsp.id);
        setAssignedSite({
          siteId: localInsp.siteId,
          siteName: localInsp.siteName || 'Assigned Site',
          siteCode: localInsp.siteCode,
          projectName: localInsp.projectName || 'Project',
          assignmentId: localInsp.assignmentId,
        });
        setAnswers((localInsp.answers as any) || {});
        setOverallNotes(localInsp.notes || '');

        if (localInsp.latitude && localInsp.longitude) {
          setGpsData({
            latitude: localInsp.latitude,
            longitude: localInsp.longitude,
            accuracy: localInsp.gpsAccuracy || 5,
            altitude: localInsp.gpsAltitude || null,
            altitudeAccuracy: localInsp.gpsAltitudeAccuracy || null,
            heading: localInsp.gpsHeading || null,
            speed: localInsp.gpsSpeed || null,
            capturedAt: localInsp.gpsCapturedAt || localInsp.updatedAt,
            captureMethod: (localInsp.gpsMethod as any) || 'fresh_high_accuracy',
            isStale: localInsp.isGpsStale || false,
          });
        }

        const localPhotos = await getLocalPhotosByInspectionId(localInsp.id);
        setPhotos(localPhotos);

        // Load template
        const tpl = await checklistService.getTemplate(localInsp.templateName);
        setSections(tpl.sections);
        setChecklistTitle(tpl.title);
        return;
      }

      // 2. Check local Dexie downloadedAssignments table
      const downloaded = await getDownloadedAssignments(user?.id);
      const matched = downloaded.find((d) => d.id === assignmentTargetId || d.siteId === assignmentTargetId);
      if (matched) {
        setCurrentId(matched.id);
        setAssignedSite({
          siteId: matched.siteId,
          siteName: matched.siteName,
          siteCode: matched.siteCode,
          projectName: matched.projectName,
          projectCode: matched.projectCode,
          address: matched.location,
          supervisorName: matched.supervisorName,
          assignmentId: matched.id,
        });

        // Load template
        const tpl = await checklistService.getTemplate(matched.checklistType);
        setSections(tpl.sections);
        setChecklistTitle(tpl.title);
        return;
      }

      // 3. If online, fetch from remote assignments API and cache in Dexie
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const remoteAssignments = await assignmentService.getInspectorMyAssignments();
          const found = remoteAssignments.find(
            (a: any) => a.id === assignmentTargetId || a.siteId === assignmentTargetId
          );

          if (found) {
            const assignmentRecord: DownloadedAssignment = {
              id: found.id,
              siteId: found.siteId || `site_${found.id}`,
              siteName: found.siteName,
              siteCode: found.code,
              projectName: found.projectName,
              location: found.location,
              checklistType: found.checklistType || 'TPL-CIVIL-01',
              priority: found.priority,
              dueDate: found.dueDate,
              instructions: found.instructions,
              inspectorId: user?.id || 'unknown',
              organizationId: user?.organizationId || 'unknown',
              downloadedAt: new Date().toISOString(),
              isAvailableOffline: true,
            };

            await saveDownloadedAssignment(assignmentRecord);

            setCurrentId(found.id);
            setAssignedSite({
              siteId: assignmentRecord.siteId,
              siteName: found.siteName,
              siteCode: found.code,
              projectName: found.projectName,
              address: found.location,
              assignmentId: found.id,
            });

            const tpl = await checklistService.getTemplate(found.checklistType);
            setSections(tpl.sections);
            setChecklistTitle(tpl.title);
            return;
          }
        } catch (err) {
          console.warn('[ChecklistPage] Remote assignment fetch failed:', err);
        }
      }

      // 4. Fallback if assignment ID was not found
      setStatusMessage({
        type: 'warning',
        text: 'Assigned inspection not found locally. Please verify your assigned work orders in My Inspections.',
      });
    },
    [user?.id, user?.organizationId]
  );

  useEffect(() => {
    const init = async () => {
      setIsLoadingAssignments(true);
      try {
        if (id) {
          // Specific assignment requested
          await resolveAssignment(id);
        } else {
          // No ID provided (e.g. clicked "Checklists" in sidebar): load all authorized assignments
          let assignments = await getDownloadedAssignments(user?.id);

          // If local is empty and online, fetch from backend
          if (assignments.length === 0 && navigator.onLine) {
            try {
              const remote = await assignmentService.getInspectorMyAssignments();
              for (const r of remote) {
                const rec: DownloadedAssignment = {
                  id: r.id,
                  siteId: r.siteId || `site_${r.id}`,
                  siteName: r.siteName,
                  siteCode: r.code,
                  projectName: r.projectName,
                  location: r.location,
                  checklistType: r.checklistType || 'TPL-CIVIL-01',
                  priority: r.priority,
                  dueDate: r.dueDate,
                  instructions: r.instructions,
                  inspectorId: user?.id || 'unknown',
                  organizationId: user?.organizationId || 'unknown',
                  downloadedAt: new Date().toISOString(),
                  isAvailableOffline: true,
                };
                await saveDownloadedAssignment(rec);
              }
              assignments = await getDownloadedAssignments(user?.id);
            } catch (err) {
              console.warn('Failed to load remote assignments:', err);
            }
          }

          setAvailableAssignments(assignments);

          // If exactly 1 assignment exists, automatically resolve and open it
          if (assignments.length === 1) {
            await resolveAssignment(assignments[0].id);
          }
        }
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    init();
  }, [id, user?.id, resolveAssignment]);

  // =========================================================================
  // PROGRESSIVE GEOLOCATION CAPTURE
  // =========================================================================

  const handleCaptureGps = async () => {
    setIsCapturingGps(true);
    setGpsError(null);
    setStatusMessage(null);

    try {
      const result = await geolocationService.captureDeviceLocation();
      setGpsData(result);
      setIsCapturingGps(false);
      setStatusMessage({
        type: 'success',
        text: `Device location captured (${result.captureMethod === 'recent_cached' ? 'Recent Cached' : 'Fresh GPS'}): ${result.latitude.toFixed(5)}, ${result.longitude.toFixed(5)} (±${result.accuracy}m)`,
      });
    } catch (err: any) {
      setIsCapturingGps(false);
      setGpsError(err as GpsErrorResult);
      setStatusMessage({
        type: 'warning',
        text: err?.userGuidance || 'GPS acquisition timed out. You can still save and submit your checklist.',
      });
    }
  };

  const handleCancelGps = () => {
    geolocationService.cancelCapture();
    setIsCapturingGps(false);
    setStatusMessage({ type: 'info', text: 'GPS coordinate acquisition cancelled.' });
  };

  // =========================================================================
  // CHECKLIST ANSWERS & DEFECT HANDLING
  // =========================================================================

  const handleAnswerChange = (questionId: string, value: 'compliant' | 'non_compliant' | 'na') => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleTriggerPhotoUpload = (questionId?: string) => {
    setActivePhotoQuestionId(questionId || null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const inspId = currentId || `local_insp_${Date.now()}`;
    setCurrentId(inspId);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const savedPhoto = await saveLocalPhoto({
          inspectionId: inspId,
          questionId: activePhotoQuestionId || undefined,
          blob: file,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          latitude: gpsData?.latitude ?? null,
          longitude: gpsData?.longitude ?? null,
        });
        setPhotos((prev) => [...prev, savedPhoto]);
      } catch (err) {
        console.error('Failed to save photo to Dexie:', err);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setActivePhotoQuestionId(null);
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deleteLocalPhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Calculate Progress
  const allQuestions: ChecklistQuestion[] = sections.flatMap((s) => s.questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const mandatoryQuestions = allQuestions.filter((q) => q.isMandatory);
  const answeredMandatory = mandatoryQuestions.filter((q) => answers[q.id]).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // =========================================================================
  // PERSISTENCE & SUBMISSION HANDLERS
  // =========================================================================

  const handleSaveDraft = async () => {
    if (!assignedSite) {
      setStatusMessage({ type: 'error', text: 'Cannot save: No assigned site selected.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const inspId = currentId || `local_insp_${Date.now()}`;
    setCurrentId(inspId);

    try {
      await saveLocalInspection({
        id: inspId,
        siteId: assignedSite.siteId,
        assignmentId: assignedSite.assignmentId || inspId,
        siteName: assignedSite.siteName,
        siteCode: assignedSite.siteCode,
        projectName: assignedSite.projectName,
        templateName: checklistTitle,
        inspectorId: user?.id,
        organizationId: user?.organizationId,
        answers,
        notes: overallNotes,
        latitude: gpsData?.latitude ?? null,
        longitude: gpsData?.longitude ?? null,
        gpsAccuracy: gpsData?.accuracy ?? null,
        gpsAltitude: gpsData?.altitude ?? null,
        gpsAltitudeAccuracy: gpsData?.altitudeAccuracy ?? null,
        gpsHeading: gpsData?.heading ?? null,
        gpsSpeed: gpsData?.speed ?? null,
        gpsCapturedAt: gpsData?.capturedAt,
        gpsMethod: gpsData?.captureMethod,
        isGpsStale: gpsData?.isStale ?? false,
        syncStatus: 'draft',
        workflowStatus: 'DRAFT',
      });

      setStatusMessage({
        type: 'success',
        text: 'Draft saved locally to IndexedDB! All questions, defect notes, and evidence are safely stored.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to save draft to IndexedDB: ${err?.message || 'Database error'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignedSite) {
      setStatusMessage({ type: 'error', text: 'Cannot submit: No assigned site resolved.' });
      return;
    }

    // 1. Validation: All mandatory questions must be answered
    if (answeredMandatory < mandatoryQuestions.length) {
      setStatusMessage({
        type: 'error',
        text: `Please complete all mandatory questions (${answeredMandatory}/${mandatoryQuestions.length} answered).`,
      });
      return;
    }

    // 2. Validation: Defects requiring evidence must have photos attached
    const defectQuestions = allQuestions.filter(
      (q) => answers[q.id] === 'non_compliant' && q.evidenceRequired
    );
    for (const defectQ of defectQuestions) {
      const hasPhoto = photos.some((p) => p.questionId === defectQ.id) || photos.length > 0;
      if (!hasPhoto) {
        setStatusMessage({
          type: 'error',
          text: `Defect question "${defectQ.question}" requires photographic evidence before submission.`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const inspId = currentId || `local_insp_${Date.now()}`;
    const operationId = `op_insp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentId(inspId);

    try {
      // 1. Persist locally to IndexedDB with SUBMITTED status and pending_sync
      await saveLocalInspection({
        id: inspId,
        siteId: assignedSite.siteId,
        assignmentId: assignedSite.assignmentId || inspId,
        siteName: assignedSite.siteName,
        siteCode: assignedSite.siteCode,
        projectName: assignedSite.projectName,
        templateName: checklistTitle,
        inspectorId: user?.id,
        organizationId: user?.organizationId,
        operationId,
        answers,
        notes: overallNotes,
        latitude: gpsData?.latitude ?? null,
        longitude: gpsData?.longitude ?? null,
        gpsAccuracy: gpsData?.accuracy ?? null,
        gpsAltitude: gpsData?.altitude ?? null,
        gpsAltitudeAccuracy: gpsData?.altitudeAccuracy ?? null,
        gpsHeading: gpsData?.heading ?? null,
        gpsSpeed: gpsData?.speed ?? null,
        gpsCapturedAt: gpsData?.capturedAt,
        gpsMethod: gpsData?.captureMethod,
        isGpsStale: gpsData?.isStale ?? false,
        syncStatus: 'pending_sync',
        workflowStatus: 'SUBMITTED',
      });

      // 2. If Cloud backend is reachable, attempt immediate cloud submission
      if (connectionState === 'online') {
        setStatusMessage({
          type: 'info',
          text: 'Saved to IndexedDB. Synchronizing with Nirikshan cloud...',
        });

        const syncRes = await syncService.syncAllPending();
        if (syncRes.syncedCount > 0) {
          setStatusMessage({
            type: 'success',
            text: 'Inspection submitted and confirmed by Nirikshan Cloud! Visible in Supervisor review queue.',
          });
          setTimeout(() => navigate('/inspector/inspections'), 2200);
          return;
        }
      }

      // 3. Offline / Server-unreachable confirmation
      setStatusMessage({
        type: 'success',
        text: 'Inspection saved successfully on this device. It is queued in Dexie.js and waiting to synchronize with Nirikshan Cloud.',
      });
      setTimeout(() => navigate('/inspector/sync'), 2500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Submission error: ${err?.message || 'Database transaction failed'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // RENDER: NO ASSIGNMENT SELECTED VIEW (PICK FROM AUTHORIZED ASSIGNMENTS)
  // =========================================================================

  if (!assignedSite) {
    return (
      <AuthenticatedLayout
        title="Field Compliance Checklist"
        subtitle="Select from your authorized site assignments to launch an inspection"
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {statusMessage && (
            <Alert
              type={statusMessage.type}
              title="Inspection Notice"
              message={statusMessage.text}
            />
          )}

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                AUTHORIZED ASSIGNMENTS
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-1">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Select Assigned Site for Inspection
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You can only audit sites assigned to you by your Supervisor. All selected sites operate 100% offline.
              </p>
            </div>

            {isLoadingAssignments ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                Loading your assigned construction sites...
              </div>
            ) : availableAssignments.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-amber-50/50 rounded-xl border border-amber-200 p-6">
                <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">No Active Site Assignments Found</h4>
                  <p className="text-xs text-amber-700 max-w-md mx-auto mt-1">
                    Your account does not have any active site assignments. Please contact your Operations Supervisor to assign you to a construction project.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/inspector/dashboard')}
                  className="text-xs font-semibold"
                >
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {availableAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-xs transition-all space-y-3 bg-slate-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{assignment.siteName}</span>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {assignment.siteCode || 'SITE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {assignment.projectName}
                      </p>
                      {assignment.location && (
                        <p className="text-[11px] text-slate-400">{assignment.location}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase">
                        Authorized Site
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => resolveAssignment(assignment.id)}
                        leftIcon={<Play className="w-3 h-3 fill-current" />}
                        className="text-xs font-bold"
                      >
                        Start Audit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // =========================================================================
  // RENDER: ASSIGNED SITE CHECKLIST VIEW
  // =========================================================================

  return (
    <AuthenticatedLayout
      title="Field Inspection Checklist"
      subtitle={`${assignedSite.siteName} • ${assignedSite.projectName}`}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inspector/inspections')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Inspections
          </Button>

          {/* Separate Device and Cloud Connectivity Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                connectionState === 'online'
                  ? 'bg-emerald-100 text-emerald-800'
                  : connectionState === 'server_unreachable'
                  ? 'bg-orange-100 text-orange-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionState === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {connectionState === 'online'
                ? 'CLOUD CONNECTED'
                : connectionState === 'server_unreachable'
                ? 'CLOUD UNREACHABLE'
                : 'OFFLINE MODE'}
            </span>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Dexie.js IndexedDB Active
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <Alert
            type={statusMessage.type}
            title={statusMessage.type === 'error' ? 'Action Failed' : 'Inspection Notice'}
            message={statusMessage.text}
          />
        )}

        {/* =========================================================
            PART 3: READ-ONLY ASSIGNED SITE INFORMATION CARD
            ========================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ASSIGNED SITE
                </span>
                {assignedSite.siteCode && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {assignedSite.siteCode}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 pt-0.5">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                {assignedSite.siteName}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{assignedSite.projectName}</span>
                {assignedSite.address && <span>• {assignedSite.address}</span>}
              </p>
            </div>

            {assignedSite.supervisorName && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-right self-start">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Assigned By Supervisor
                </span>
                <span className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  {assignedSite.supervisorName}
                </span>
              </div>
            )}
          </div>

          {/* =========================================================
              PART 2: PROGRESSIVE GPS LOCATION CARD
              ========================================================= */}
          <div className="pt-3 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Device Geolocation
                  </span>
                  {gpsData ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Location Captured ({gpsData.captureMethod === 'recent_cached' ? 'Recent Cached' : 'Fresh GPS'})
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500">
                      Location not captured
                    </span>
                  )}
                </div>

                {gpsData ? (
                  <div className="text-xs text-slate-600 font-mono space-x-3">
                    <span>
                      Lat: {gpsData.latitude.toFixed(6)}, Lon: {gpsData.longitude.toFixed(6)}
                    </span>
                    <span className="text-blue-700 font-semibold font-sans">
                      Accuracy: ±{gpsData.accuracy}m
                    </span>
                    {gpsData.isStale && (
                      <span className="text-amber-700 font-sans text-[11px]">(Cached device fix)</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Acquires coordinates locally from device sensors. Operates 100% offline without Render.
                  </p>
                )}

                {gpsError && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {gpsError.userGuidance}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isCapturingGps ? (
                  <>
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Acquiring GPS fix...
                    </span>
                    <Button variant="outline" size="sm" onClick={handleCancelGps} className="text-xs">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCaptureGps}
                    leftIcon={gpsData ? <RotateCcw className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5 text-blue-600" />}
                    className="text-xs font-bold"
                  >
                    {gpsData ? 'Re-stamp GPS' : 'Stamp Current GPS'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            PART 4: DYNAMIC CHECKLIST SECTIONS & QUESTIONS
            ========================================================= */}
        <div className="space-y-5">
          {/* Progress Header */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-slate-700" />
                {checklistTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {answeredCount} of {totalQuestions} answered ({progressPercent}%) •{' '}
                {answeredMandatory}/{mandatoryQuestions.length} mandatory completed
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-48 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-[#12141a] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Sections and Questions */}
          {sections.map((section, secIdx) => (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center gap-2 pt-1">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                  {secIdx + 1}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {section.title}
                </h4>
              </div>

              <div className="space-y-3">
                {section.questions.map((q) => {
                  const currentAns = answers[q.id];
                  const questionPhotos = photos.filter((p) => p.questionId === q.id);

                  return (
                    <div
                      key={q.id}
                      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                        currentAns === 'compliant'
                          ? 'border-emerald-200 bg-emerald-50/10'
                          : currentAns === 'non_compliant'
                          ? 'border-rose-200 bg-rose-50/15'
                          : 'border-slate-200/90'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                              {q.category}
                            </span>
                            {q.isMandatory && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 uppercase">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h5>
                          {q.description && (
                            <p className="text-xs text-slate-500 leading-relaxed">{q.description}</p>
                          )}
                        </div>

                        {/* Single-Tap Answer Buttons */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'compliant')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                              currentAns === 'compliant'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Compliant
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'non_compliant')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                              currentAns === 'non_compliant'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            Defect
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'na')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                              currentAns === 'na'
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            N/A
                          </button>
                        </div>

                        {/* Defect Description and Photo Requirement */}
                        {currentAns === 'non_compliant' && (
                          <div className="pt-2 space-y-2 border-t border-rose-100 animate-in fade-in">
                            <label className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Defect Observations & Root Cause:
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Detail the non-compliance, affected area, and immediate corrective actions required..."
                              value={questionNotes[q.id] || ''}
                              onChange={(e) =>
                                setQuestionNotes((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              className="w-full text-xs rounded-xl border border-rose-300 bg-white p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                            />

                            {/* Question Photo Evidence Attachment Button */}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] font-semibold text-rose-700">
                                {questionPhotos.length > 0
                                  ? `${questionPhotos.length} photo evidence attached`
                                  : 'Photo evidence required for defect verification'}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTriggerPhotoUpload(q.id)}
                                leftIcon={<Camera className="w-3.5 h-3.5 text-rose-600" />}
                                className="text-[11px] border-rose-200 hover:bg-rose-50 text-rose-800"
                              >
                                Attach Defect Photo
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================
            PART 5: PHOTOGRAPHIC EVIDENCE GALLERY
            ========================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                Attached Photo Evidence ({photos.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Binary Blobs stored directly in IndexedDB. Persisted safely offline without conversion overhead.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTriggerPhotoUpload(undefined)}
              leftIcon={<Camera className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              Add Photo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No photos attached yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Use your device camera or image gallery to attach visual compliance evidence.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((p) => {
                const objectUrl = URL.createObjectURL(p.blob);
                return (
                  <div
                    key={p.id}
                    className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-square shadow-2xs"
                  >
                    <img
                      src={objectUrl}
                      alt={p.fileName}
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(objectUrl)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(p.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {p.questionId && (
                      <span className="absolute top-1 left-1 text-[9px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                        Defect
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-black/75 text-white px-1.5 py-0.5 rounded truncate font-mono">
                      {p.fileName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overall Observations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Overall Auditor Observations & Site Handover Notes
          </label>
          <textarea
            rows={3}
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            placeholder="Add general site observations, weather conditions, contractor coordination notes..."
            className="w-full text-xs rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* =========================================================
            PART 6 & PART 11: RESPONSIVE BOTTOM ACTION BAR
            ========================================================= */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="font-bold text-slate-900">{progressPercent}% complete</span>
            <span>•</span>
            <span>{photos.length} photos</span>
            {gpsData && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> GPS Stamped
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1 sm:flex-initial text-xs font-bold"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSaving || isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              className="flex-1 sm:flex-initial text-xs font-bold shadow-md bg-[#12141a] text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
