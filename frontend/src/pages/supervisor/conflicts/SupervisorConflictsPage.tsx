import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  GitCompare,
  CheckCircle2,
  RefreshCw,
  Building2,
  MapPin,
  User,
  HelpCircle,
} from 'lucide-react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { conflictService } from '../../../services/conflict.service';
import type { ConflictItem } from '../../../services/conflict.service';

export const SupervisorConflictsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Resolution form state
  const [resolutionChoice, setResolutionChoice] = useState<'ACCEPT_SERVER' | 'ACCEPT_INCOMING' | 'MANUAL_MERGE'>('ACCEPT_SERVER');
  const [resolutionReason, setResolutionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadConflicts = async () => {
    try {
      setLoading(true);
      const data = await conflictService.listConflicts();
      setConflicts(data.conflicts || []);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConflicts();
  }, []);

  const openDiffModal = async (item: ConflictItem) => {
    setSelectedConflict(item);
    setResolutionReason('');
    try {
      setDiffLoading(true);
      await conflictService.getConflictDiff(item._id);
    } catch (err) {
      console.error('Failed to load diff:', err);
    } finally {
      setDiffLoading(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict || resolutionReason.trim().length < 5) return;
    try {
      setActionLoading(true);
      await conflictService.resolveConflict(selectedConflict._id, {
        resolutionChoice,
        resolutionReason: resolutionReason.trim(),
      });
      setSelectedConflict(null);
      await loadConflicts();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to resolve conflict');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              Conflict Resolution & Data Integrity
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Review concurrent offline edits, resolve compliance variances, and safeguard inspection integrity.
            </p>
          </div>
          <button
            onClick={loadConflicts}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Conflicts
          </button>
        </div>

        {/* Informational Guidance Alert */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Conflict Policy: No Silent Overwrites</span>
            <p className="mt-0.5 text-zinc-300">
              When two inspectors or offline devices modify identical compliance clauses, Nirikshan flags a concurrency conflict.
              Supervisors must explicitly choose the authoritative value and log a reasoned justification before finalizing the audit.
            </p>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
              <p className="text-sm">Scanning for synchronization conflicts...</p>
            </div>
          ) : conflicts.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
              <h3 className="text-base font-semibold text-zinc-200">Zero Synchronization Conflicts</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                All field devices and offline queues within your assigned projects are cleanly reconciled with MongoDB cloud storage.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {conflicts.map((item) => (
                <div key={item._id} className="p-5 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        {item.inspectionCode}
                      </span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {item.conflictingFields?.length || 1} Variance Clashes
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        {item.projectId?.projectName}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {item.siteId?.siteName}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-300">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        {item.inspectorId?.fullName}
                      </span>
                      <span className="text-zinc-500 text-[11px]">
                        Received: {new Date(item.serverReceivedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openDiffModal(item)}
                    className="self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition-colors"
                  >
                    <GitCompare className="w-4 h-4" /> Compare & Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side-by-Side Diff & Resolution Modal */}
        {selectedConflict && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-amber-400" />
                    Side-by-Side Concurrency Comparison
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Inspection: {selectedConflict.inspectionCode} (Base Ver: {selectedConflict.baseServerVersion})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConflict(null)}
                  className="text-zinc-400 hover:text-white text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {diffLoading ? (
                <div className="p-12 text-center text-zinc-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                  <p className="text-xs">Computing diff tree...</p>
                </div>
              ) : (
                <form onSubmit={handleResolveSubmit} className="mt-5 space-y-5">
                  {/* Diff Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Server Revision Column */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2">
                        <span className="text-xs font-bold text-blue-400">Cloud Server Revision</span>
                        <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">
                          Rev #{selectedConflict.serverRevisionNumber}
                        </span>
                      </div>
                      <div className="space-y-3 text-xs">
                        {selectedConflict.conflictingFields?.map((f, idx) => (
                          <div key={idx} className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block mb-0.5">{f.field}</span>
                            <span className="font-semibold text-zinc-200">{String(f.serverValue || 'Compliant')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Incoming Local Revision Column */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2">
                        <span className="text-xs font-bold text-amber-400">Incoming Field Device</span>
                        <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">
                          Rev #{selectedConflict.incomingRevisionNumber}
                        </span>
                      </div>
                      <div className="space-y-3 text-xs">
                        {selectedConflict.conflictingFields?.map((f, idx) => (
                          <div key={idx} className="bg-zinc-900/60 p-2.5 rounded-lg border border-amber-500/20">
                            <span className="text-[10px] text-amber-400/80 block mb-0.5">{f.field}</span>
                            <span className="font-semibold text-white">{String(f.incomingValue || 'Defect')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resolution Decision Radio Group */}
                  <div>
                    <label className="text-xs font-bold text-white block mb-2">Authoritative Decision</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center gap-2 ${
                          resolutionChoice === 'ACCEPT_SERVER'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-200'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resolutionChoice"
                          value="ACCEPT_SERVER"
                          checked={resolutionChoice === 'ACCEPT_SERVER'}
                          onChange={() => setResolutionChoice('ACCEPT_SERVER')}
                          className="accent-blue-500"
                        />
                        <span className="font-semibold">Accept Server Value</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center gap-2 ${
                          resolutionChoice === 'ACCEPT_INCOMING'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-200'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resolutionChoice"
                          value="ACCEPT_INCOMING"
                          checked={resolutionChoice === 'ACCEPT_INCOMING'}
                          onChange={() => setResolutionChoice('ACCEPT_INCOMING')}
                          className="accent-amber-500"
                        />
                        <span className="font-semibold">Accept Incoming Value</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center gap-2 ${
                          resolutionChoice === 'MANUAL_MERGE'
                            ? 'bg-lime-500/10 border-lime-400 text-lime-200'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resolutionChoice"
                          value="MANUAL_MERGE"
                          checked={resolutionChoice === 'MANUAL_MERGE'}
                          onChange={() => setResolutionChoice('MANUAL_MERGE')}
                          className="accent-lime-400"
                        />
                        <span className="font-semibold">Manual Field Merge</span>
                      </label>
                    </div>
                  </div>

                  {/* Mandatory Resolution Reason */}
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Resolution Reason & Audit Rationale <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      placeholder="Explain the engineering or physical evidence rationale for this resolution decision..."
                      value={resolutionReason}
                      onChange={(e) => setResolutionReason(e.target.value)}
                      className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 h-20"
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setSelectedConflict(null)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || resolutionReason.trim().length < 5}
                      className="px-5 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black rounded-xl transition-colors disabled:opacity-50"
                    >
                      Apply Resolution Decision
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};
