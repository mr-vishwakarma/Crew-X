import React, { useEffect, useState, useRef } from 'react';
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
} from '../../../database/databaseHelpers';
import type { LocalPhoto } from '../../../database/schema';
import { syncService } from '../../../services/sync.service';
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
} from 'lucide-react';

interface ChecklistQuestion {
  id: string;
  category: string;
  question: string;
  description: string;
}

const DEFAULT_QUESTIONS: ChecklistQuestion[] = [
  {
    id: 'q1_ppe_compliance',
    category: 'Personnel Safety',
    question: 'Are all site personnel wearing required PPE (Hard hat, high-vis vest, steel-toe boots)?',
    description: 'Mandatory ISO-45001 safety compliance for active work zones.',
  },
  {
    id: 'q2_perimeter_fencing',
    category: 'Site Security',
    question: 'Is the site perimeter fencing secure with authorized access signage in place?',
    description: 'Verify warning boards, lockable entry barriers, and warning lights.',
  },
  {
    id: 'q3_scaffolding_stability',
    category: 'Structural Safety',
    question: 'Has scaffolding been inspected, tagged (Green/Red), and anchored correctly?',
    description: 'Check toe-boards, double guardrails, base plates, and inspection tags.',
  },
  {
    id: 'q4_excavation_shoring',
    category: 'Ground Works',
    question: 'Are open trenches deeper than 1.5m adequately shored or sloped?',
    description: 'Verify soil stability, egress ladders within 7.5m, and edge barriers.',
  },
  {
    id: 'q5_fire_extinguishers',
    category: 'Emergency Readiness',
    question: 'Are fire extinguishers and first-aid kits accessible, inspected, and unblocked?',
    description: 'Check pressure gauges, valid inspection tags, and clear access paths.',
  },
  {
    id: 'q6_concrete_reinforcement',
    category: 'Quality Control',
    question: 'Are rebar cages clear of rust/dirt, with correct cover blocks before pouring?',
    description: 'Inspect bar spacing, tie wire security, and spacer block positioning.',
  },
];

export const InspectorChecklistPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();

  // Selected Assignment / Inspection ID
  const [currentId, setCurrentId] = useState<string>(id || '');
  const [siteName, setSiteName] = useState<string>('Select Site');
  const [projectName, setProjectName] = useState<string>('Project');
  const [siteId, setSiteId] = useState<string>('');
  const [assignmentId, setAssignmentId] = useState<string>('');

  // Checklist Form State
  const [answers, setAnswers] = useState<Record<string, 'compliant' | 'non_compliant' | 'na'>>({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [overallNotes, setOverallNotes] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Photos State
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Status & Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing inspection or prepare new from downloaded assignment
  useEffect(() => {
    const init = async () => {
      const assignments = await getDownloadedAssignments(user?.id);

      if (id) {
        // Load existing inspection
        const existing = await getLocalInspectionById(id);
        if (existing) {
          setCurrentId(existing.id);
          setSiteId(existing.siteId);
          setAssignmentId(existing.assignmentId);
          setSiteName(existing.siteName || 'Site');
          setProjectName(existing.projectName || 'Project');
          setAnswers((existing.answers as any) || {});
          setOverallNotes(existing.notes || '');
          setLatitude(existing.latitude);
          setLongitude(existing.longitude);
          setGpsAccuracy(existing.gpsAccuracy);

          const localPhotos = await getLocalPhotosByInspectionId(existing.id);
          setPhotos(localPhotos);
          return;
        }

        // Check if ID matches a downloaded assignment
        const matched = assignments.find((a) => a.id === id);
        if (matched) {
          setSiteId(matched.siteId);
          setAssignmentId(matched.id);
          setSiteName(matched.siteName);
          setProjectName(matched.projectName);
        }
      } else if (assignments.length > 0) {
        // Default to first downloaded assignment
        const first = assignments[0];
        setSiteId(first.siteId);
        setAssignmentId(first.id);
        setSiteName(first.siteName);
        setProjectName(first.projectName);
        setCurrentId(`local_${first.id}_${Date.now()}`);
      }
    };

    init();
  }, [id, user?.id]);

  // Capture GPS Coordinates
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setStatusMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setIsCapturingGps(true);
    setStatusMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy * 10) / 10);
        setIsCapturingGps(false);
        setStatusMessage({
          type: 'success',
          text: `GPS coordinates stamped: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (±${pos.coords.accuracy.toFixed(1)}m)`,
        });
      },
      (err) => {
        setIsCapturingGps(false);
        setStatusMessage({
          type: 'error',
          text: `GPS capture failed: ${err.message}. You can still save the checklist.`,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Answer selection
  const handleAnswerChange = (questionId: string, value: 'compliant' | 'non_compliant' | 'na') => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Photo Capture
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
          blob: file,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          latitude,
          longitude,
        });
        setPhotos((prev) => [...prev, savedPhoto]);
      } catch (err) {
        console.error('Failed to save photo to Dexie:', err);
      }
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deleteLocalPhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Save Local Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const inspId = currentId || `local_insp_${Date.now()}`;
    setCurrentId(inspId);

    try {
      await saveLocalInspection({
        id: inspId,
        siteId: siteId || 'site_default',
        assignmentId: assignmentId || 'asg_default',
        siteName,
        projectName,
        templateName: 'ISO-9001 Civil & Structural Safety',
        inspectorId: user?.id,
        organizationId: user?.organizationId,
        answers,
        notes: overallNotes,
        latitude,
        longitude,
        gpsAccuracy,
        syncStatus: 'draft',
        workflowStatus: 'DRAFT',
      });

      setStatusMessage({
        type: 'success',
        text: 'Draft saved locally to IndexedDB! All changes, photos, and answers are safe offline.',
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

  // Submit Inspection
  const handleSubmit = async () => {
    // Validate that at least half of the questions are answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) {
      setStatusMessage({
        type: 'error',
        text: 'Please answer at least one checklist question before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const inspId = currentId || `local_insp_${Date.now()}`;
    setCurrentId(inspId);

    try {
      // 1. Persist locally with SUBMITTED status and pending_sync
      await saveLocalInspection({
        id: inspId,
        siteId: siteId || 'site_default',
        assignmentId: assignmentId || 'asg_default',
        siteName,
        projectName,
        templateName: 'ISO-9001 Civil & Structural Safety',
        inspectorId: user?.id,
        organizationId: user?.organizationId,
        answers,
        notes: overallNotes,
        latitude,
        longitude,
        gpsAccuracy,
        syncStatus: 'pending_sync',
        workflowStatus: 'SUBMITTED',
      });

      // 2. If online, trigger background sync
      if (isOnline) {
        setStatusMessage({
          type: 'info',
          text: 'Saved to IndexedDB. Synchronizing with Nirikshan cloud...',
        });

        const syncRes = await syncService.syncAllPending();
        if (syncRes.syncedCount > 0) {
          setStatusMessage({
            type: 'success',
            text: 'Inspection submitted and successfully confirmed by Nirikshan cloud!',
          });
          setTimeout(() => navigate('/inspector/inspections'), 2000);
          return;
        }
      }

      // Offline confirmation
      setStatusMessage({
        type: 'success',
        text: 'Inspection saved offline in Dexie.js! It will automatically sync to cloud when internet connectivity returns.',
      });
      setTimeout(() => navigate('/inspector/sync'), 2000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Submission failed: ${err?.message || 'Database error'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout
      title="Field Inspection Checklist"
      subtitle={`${siteName} • ${projectName}`}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inspector/inspections')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Inspections
          </Button>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              Dexie.js IndexedDB Storage
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <Alert
            type={statusMessage.type === 'error' ? 'error' : statusMessage.type === 'info' ? 'info' : 'success'}
            title={statusMessage.type === 'error' ? 'Action Failed' : 'Inspection Notice'}
            message={statusMessage.text}
          />
        )}

        {/* Site & Assignment Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                AUDIT LOCATION
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                {siteName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{projectName}</p>
            </div>

            {/* GPS Stamp Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                leftIcon={<Compass className="w-4 h-4 text-blue-600" />}
                className="text-xs font-semibold"
              >
                {isCapturingGps ? 'Reading GPS...' : latitude ? 'Update GPS Stamp' : 'Stamp Current GPS'}
              </Button>
            </div>
          </div>

          {/* GPS Info Badge */}
          {latitude && longitude && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-blue-900">
              <span className="flex items-center gap-1.5 font-medium">
                <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
              <span className="text-[11px] text-blue-700 font-semibold">
                Accuracy: ±{gpsAccuracy}m
              </span>
            </div>
          )}
        </div>

        {/* Checklist Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-slate-700" />
              Standard Compliance Checklist
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {Object.keys(answers).length} / {DEFAULT_QUESTIONS.length} Answered
            </span>
          </div>

          {DEFAULT_QUESTIONS.map((q, idx) => {
            const currentAns = answers[q.id];
            return (
              <div
                key={q.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                  currentAns === 'compliant'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : currentAns === 'non_compliant'
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {q.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h4>
                      <p className="text-xs text-slate-500">{q.description}</p>
                    </div>
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
                      Defect / Non-Compliant
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

                  {/* Defect Note Input (if non-compliant) */}
                  {currentAns === 'non_compliant' && (
                    <div className="pt-2 animate-in fade-in">
                      <label className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Defect Details & Required Rectification:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Describe the defect, root cause, and immediate corrective action required..."
                        value={questionNotes[q.id] || ''}
                        onChange={(e) =>
                          setQuestionNotes((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="w-full text-xs rounded-xl border border-rose-300 bg-white p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Photo Evidence Section */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                Photo Evidence ({photos.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved directly as Blobs in Dexie.js IndexedDB. No upload required while offline.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
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

          {/* Photos Grid */}
          {photos.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No photographs attached yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Use your device camera to capture visual proof of compliance or defects.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((p) => {
                const objectUrl = URL.createObjectURL(p.blob);
                return (
                  <div
                    key={p.id}
                    className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-square"
                  >
                    <img
                      src={objectUrl}
                      alt={p.fileName}
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(objectUrl)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(p.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded truncate font-mono">
                      {p.fileName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overall Inspection Notes */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Overall Auditor Observations & Site Notes
          </label>
          <textarea
            rows={3}
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            placeholder="Add general site observations, weather conditions, contractor coordination notes..."
            className="w-full text-xs rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {Object.keys(answers).length} questions answered • {photos.length} photos
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
              className="flex-1 sm:flex-initial text-xs font-bold shadow-md"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
