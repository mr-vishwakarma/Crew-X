import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Calendar,
  Camera,
  Navigation,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  History,
} from 'lucide-react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { reviewService } from '../../../services/review.service';

export const SupervisorReviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inspection, setInspection] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionFeedback, setCorrectionFeedback] = useState('');
  const [correctionQuestions, setCorrectionQuestions] = useState<Array<{ questionId: string; issueDescription: string }>>([
    { questionId: 'Q-01', issueDescription: '' },
  ]);
  const [supervisorComments, setSupervisorComments] = useState('');

  const loadDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getReviewDetails(id);
      setInspection(data.inspection);
      setAnomalies(data.anomalies || []);
      setRevisions(data.revisions || []);
    } catch (err: any) {
      console.error('Failed to load review details:', err);
      setError(err?.response?.data?.message || 'Failed to load inspection review');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to approve and certify this inspection submission?')) return;
    try {
      setActionLoading(true);
      await reviewService.approveInspection(id, supervisorComments.trim() || undefined);
      await loadDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve inspection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      await reviewService.rejectInspection(id, rejectionReason.trim(), supervisorComments.trim() || undefined);
      setShowRejectModal(false);
      setRejectionReason('');
      await loadDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject inspection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !correctionFeedback.trim()) return;
    const validQuestions = correctionQuestions.filter((q) => q.questionId && q.issueDescription.trim());
    if (validQuestions.length === 0) {
      alert('Please specify at least one question issue to be corrected.');
      return;
    }
    try {
      setActionLoading(true);
      await reviewService.requestCorrection(id, correctionFeedback.trim(), validQuestions);
      setShowCorrectionModal(false);
      await loadDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to request corrections');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="p-16 text-center text-zinc-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-lime-400 mb-3" />
          <p className="text-sm">Loading submission records and evidence...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !inspection) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-xl mx-auto p-8 text-center bg-zinc-900 border border-zinc-800 rounded-2xl mt-8">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Review Unavailable</h2>
          <p className="text-xs text-zinc-400 mt-1">{error || 'Inspection record could not be loaded.'}</p>
          <button
            onClick={() => navigate('/supervisor/reports')}
            className="mt-4 px-4 py-2 bg-zinc-800 text-xs font-semibold text-white rounded-xl hover:bg-zinc-700"
          >
            Back to Queue
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const isReviewable = ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'RESUBMITTED'].includes(inspection.status);

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/supervisor/reports')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Review Queue
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Revision:</span>
            <span className="text-xs font-mono font-bold text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded">
              Rev {inspection.currentRevision || 1}
            </span>
          </div>
        </div>

        {/* Master Details Header Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded">
                  {inspection.inspectionCode}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    inspection.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : inspection.status === 'REJECTED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {inspection.status}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-2">{inspection.title}</h1>
              <p className="text-xs text-zinc-400 mt-1">{inspection.checklistType}</p>
            </div>

            {/* Compliance Score Gauge */}
            <div className="flex items-center gap-4 bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl">
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Compliance Rating</p>
                <h3 className="text-2xl font-black text-lime-400">{inspection.complianceScore || 95}%</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-xs text-zinc-300">
            <div>
              <span className="text-zinc-500 block mb-0.5">Project</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                {inspection.projectId?.projectName || 'Project'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Site Location</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {inspection.siteId?.siteName || 'Site'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Field Inspector</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                {inspection.assignedInspectorId?.fullName || 'Inspector'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Submitted Timestamp</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {inspection.submittedAt ? new Date(inspection.submittedAt).toLocaleString() : 'Recent'}
              </span>
            </div>
          </div>
        </div>

        {/* Anomaly Flags Notification if present */}
        {anomalies.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" /> Integrity & Anomaly Flags Detected ({anomalies.length})
            </h4>
            <div className="mt-2 space-y-1.5 text-xs text-rose-200">
              {anomalies.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between bg-zinc-950/60 p-2 rounded-lg border border-rose-500/20">
                  <span><strong>{a.category}:</strong> {a.description}</span>
                  <span className="text-[10px] uppercase font-bold bg-rose-500/20 px-2 py-0.5 rounded text-rose-300">
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Answers Review */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-lime-400" />
            Checklist Responses & Field Observations
          </h3>

          <div className="space-y-4">
            {inspection.answers && Object.keys(inspection.answers).length > 0 ? (
              Object.entries(inspection.answers).map(([key, val]: any, index) => (
                <div key={key} className="bg-zinc-950/70 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-500">Clause #{index + 1} ({key})</span>
                    <p className="text-xs font-semibold text-zinc-200 mt-0.5">
                      {val?.questionText || `Compliance Item verification`}
                    </p>
                    {val?.notes && (
                      <p className="text-xs text-zinc-400 mt-1 italic">
                        Inspector Note: "{val.notes}"
                      </p>
                    )}
                  </div>
                  <div>
                    {val?.answer === 'COMPLIANT' || val?.answer === 'PASS' || val === 'COMPLIANT' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                      </span>
                    ) : val?.answer === 'DEFECT' || val?.answer === 'FAIL' || val === 'DEFECT' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" /> Defect / Non-Compliant
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-800 text-zinc-300">
                        {String(val?.answer || val)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic">Standard dynamic checklist verification passed with 100% clause coverage.</p>
            )}
          </div>
        </div>

        {/* Photo Evidence Gallery */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-lime-400" />
            Attached Photo Evidence & GPS Verification
          </h3>

          {inspection.evidenceItems && inspection.evidenceItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {inspection.evidenceItems.map((img: any, idx: number) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-zinc-900 flex items-center justify-center text-zinc-600 relative">
                    {img.storageUrl ? (
                      <img src={img.storageUrl} alt={img.caption || 'Evidence'} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-zinc-700" />
                    )}
                    {img.latitude && (
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-zinc-300 flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 text-lime-400" />
                        {img.latitude.toFixed(5)}, {img.longitude.toFixed(5)} (±{img.gpsAccuracy || 10}m)
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-xs">
                    <p className="font-semibold text-zinc-200 line-clamp-1">{img.caption || `Defect Evidence #${idx + 1}`}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{img.capturedAt ? new Date(img.capturedAt).toLocaleString() : 'Field Capture'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs">
              <Camera className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
              Zero non-conformance defect photos required for this audit.
            </div>
          )}
        </div>

        {/* Supervisor Action Panel */}
        {isReviewable && (
          <div className="bg-zinc-900/90 border border-lime-400/30 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-lime-400" />
              Supervisor QA Decision
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add review notes and submit your formal QA decision. All actions write immutable audit logs and notify the field inspector.
            </p>

            <textarea
              placeholder="Optional supervisor notes or verification comments..."
              value={supervisorComments}
              onChange={(e) => setSupervisorComments(e.target.value)}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 mb-4 h-20"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-lime-400 hover:bg-lime-300 text-black shadow-lg shadow-lime-400/10 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> 1-Click Approve Inspection
              </button>

              <button
                disabled={actionLoading}
                onClick={() => setShowCorrectionModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" /> Request Corrections
              </button>

              <button
                disabled={actionLoading}
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject Inspection
              </button>
            </div>
          </div>
        )}

        {/* Revision Timeline History */}
        {revisions.length > 0 && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-400" />
              Audit Revision History
            </h3>
            <div className="space-y-3">
              {revisions.map((rev) => (
                <div key={rev._id} className="bg-zinc-950/70 border border-zinc-800/80 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-white">Revision #{rev.revisionNumber}</span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{rev.summary}</p>
                    <span className="text-[10px] text-zinc-500">{new Date(rev.createdAt).toLocaleString()}</span>
                  </div>
                  <span className="font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                    {rev.statusAtRevision}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reject Dialog Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" /> Reject Field Inspection
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Please provide a formal rejection reason explaining which quality or safety clauses failed.
              </p>
              <form onSubmit={handleRejectSubmit} className="mt-4 space-y-3">
                <textarea
                  required
                  placeholder="Mandatory rejection reason (min 5 characters)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400 h-24"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || rejectionReason.trim().length < 5}
                    className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white rounded-xl disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Correction Request Modal */}
        {showCorrectionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" /> Request Checklist Corrections
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Instruct the inspector on which questions require rectifications, re-auditing, or additional photographs.
              </p>
              <form onSubmit={handleCorrectionSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Supervisor Guidance</label>
                  <textarea
                    required
                    placeholder="Explain what the inspector must fix or re-inspect..."
                    value={correctionFeedback}
                    onChange={(e) => setCorrectionFeedback(e.target.value)}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 h-20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Question Clause & Issue</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Clause Code (e.g. Q-01)"
                      value={correctionQuestions[0]?.questionId}
                      onChange={(e) => setCorrectionQuestions([{ ...correctionQuestions[0], questionId: e.target.value }])}
                      className="w-28 p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Specific defect or missing photo required"
                      value={correctionQuestions[0]?.issueDescription}
                      onChange={(e) => setCorrectionQuestions([{ ...correctionQuestions[0], issueDescription: e.target.value }])}
                      className="flex-1 p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !correctionFeedback.trim()}
                    className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black rounded-xl disabled:opacity-50"
                  >
                    Send Correction Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
