import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Camera,
  Building2,
  MapPin,
  User,
} from 'lucide-react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { reviewService } from '../../../services/review.service';
import type { ReviewItem } from '../../../services/review.service';

export const SupervisorReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<ReviewItem[]>([]);
  const [metrics, setMetrics] = useState({ pendingCount: 0, underReviewCount: 0, approvedCount: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getReviewQueue({
        page,
        limit: 20,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setInspections(data.inspections || []);
      setMetrics(data.metrics || { pendingCount: 0, underReviewCount: 0, approvedCount: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQueue();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30"><Clock className="w-3 h-3" /> Awaiting Review</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30"><FileSearch className="w-3 h-3" /> Under Review</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> QA Approved</span>;
      case 'CHANGES_REQUESTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30"><AlertTriangle className="w-3 h-3" /> Corrections Requested</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="text-xs font-bold text-rose-400">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-xs font-semibold text-orange-400">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-xs font-medium text-amber-300">MEDIUM</span>;
      default:
        return <span className="text-xs text-zinc-400">LOW</span>;
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileSearch className="w-6 h-6 text-lime-400" />
              Submissions & QA Review Queue
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Verify field audit submissions, examine photo evidence, and approve compliance certifications.
            </p>
          </div>
          <button
            onClick={() => loadQueue()}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Pending Review</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{metrics.pendingCount}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Awaiting QA inspection</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">In Active Review</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{metrics.underReviewCount}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Currently being audited</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileSearch className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Approved Audits</p>
              <h3 className="text-2xl font-bold text-lime-400 mt-1">{metrics.approvedCount}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Certified compliant</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by inspection code, site, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
            />
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-lime-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted (Pending)</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-lime-400 mb-2" />
              <p className="text-sm">Loading submissions queue...</p>
            </div>
          ) : inspections.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <FileSearch className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-semibold text-zinc-200">No submissions found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No inspection submissions currently match the selected filter. Field audits submitted by your inspectors will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Audit Details</th>
                    <th className="py-3 px-4">Project & Site</th>
                    <th className="py-3 px-4">Inspector</th>
                    <th className="py-3 px-4">Score & Risk</th>
                    <th className="py-3 px-4">Evidence</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {inspections.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/supervisor/reviews/${item.id}`)}
                      className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                          {item.inspectionCode}
                        </span>
                        <p className="text-xs text-zinc-200 mt-1 font-semibold line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Rev {item.currentRevision} · {item.checklistType}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-zinc-200">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{item.projectName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{item.siteName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-zinc-200">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{item.inspectorName}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{new Date(item.submittedAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{item.complianceScore}%</span>
                          <span className="text-zinc-500">|</span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <div className="w-20 bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${item.complianceScore >= 90 ? 'bg-lime-400' : item.complianceScore >= 75 ? 'bg-amber-400' : 'bg-rose-500'}`}
                            style={{ width: `${item.complianceScore}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Camera className="w-3.5 h-3.5 text-lime-400" />
                          <span>{item.evidenceCount} photos</span>
                        </div>
                        {item.anomalyFlagsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> {item.anomalyFlagsCount} anomaly
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/supervisor/reviews/${item.id}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 transition-colors"
                        >
                          Review <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
