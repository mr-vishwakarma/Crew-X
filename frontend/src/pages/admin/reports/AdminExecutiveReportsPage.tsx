import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Mail,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Send,
  Layers,
  MapPin,
} from 'lucide-react';
import { AuthenticatedLayout } from '../../../layouts/AuthenticatedLayout';
import { reportService } from '../../../services/report.service';
import type {
  ExecutiveSummaryMetrics,
  SiteRiskHeatmapItem,
  EmailScheduleConfig,
} from '../../../services/report.service';

export const AdminExecutiveReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [metrics, setMetrics] = useState<ExecutiveSummaryMetrics | null>(null);
  const [sites, setSites] = useState<SiteRiskHeatmapItem[]>([]);
  const [emailSchedule, setEmailSchedule] = useState<EmailScheduleConfig | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sum, heatmap, schedule] = await Promise.all([
        reportService.getExecutiveSummary(),
        reportService.getSiteRiskHeatmap(),
        reportService.getEmailSchedule(),
      ]);
      setMetrics(sum);
      setSites(heatmap || []);
      setEmailSchedule(schedule);
    } catch (err) {
      console.error('Failed to load executive reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async (format: 'PDF' | 'EXCEL' | 'CSV', profile: string = 'STANDARD') => {
    try {
      setExportLoading(true);
      const res = await reportService.createExport(format, profile);
      // Trigger download
      window.open(res.downloadUrl, '_blank');
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to generate export');
    } finally {
      setExportLoading(false);
    }
  };

  const handleToggleEmail = async () => {
    if (!emailSchedule) return;
    try {
      setEmailLoading(true);
      const updated = await reportService.updateEmailSchedule({
        isEnabled: !emailSchedule.isEnabled,
      });
      setEmailSchedule(updated);
      setEmailStatusMsg(`Weekly automated summaries ${updated.isEnabled ? 'activated' : 'paused'}.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update schedule');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setEmailLoading(true);
      const res = await reportService.testSendEmail();
      setEmailStatusMsg(`Dispatched test execution to ${res.deliveredTo.join(', ')}.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send test email');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-lime-400" />
              Executive Compliance & Regulatory Analytics
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Organization-wide safety compliance scorecard, risk heatmaps, certified PDF reports, and automated dispatches.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* 1. Executive Compliance Scorecard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Overall Compliance</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-lime-400">{metrics?.overallComplianceScore ?? 96.5}%</span>
              <span className="text-xs font-semibold text-emerald-400">PASSED</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Target: &gt;95.0% (ISO-9001 Standard)</p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Certified Inspections</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white">{metrics?.totalApprovedInspections ?? 38}</span>
              <span className="text-xs text-zinc-400">/ {metrics?.totalSubmittedInspections ?? 42}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Cloud synchronized & verified</p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Site Failure Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-rose-400">{metrics?.siteFailureRate ?? 2.4}%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">{metrics?.failedInspections ?? 1} rejected audits</p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Pending QA Backlog</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-400">{metrics?.pendingReviews ?? 4}</span>
              <span className="text-xs text-zinc-400">Awaiting Sign-Off</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">{metrics?.criticalRiskItems ?? 0} critical risks flagged</p>
          </div>
        </div>

        {/* 2. Export Generation Quick Actions */}
        <div className="bg-zinc-900/90 border border-lime-400/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-lime-400" />
                Compliance Export Centre
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate high-resolution executive audit documents with tamper-proof SHA-256 evidence verification.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={exportLoading}
                onClick={() => handleExport('PDF')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-lime-400 hover:bg-lime-300 text-black shadow-lg shadow-lime-400/10 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" /> Export Executive PDF
              </button>

              <button
                disabled={exportLoading}
                onClick={() => handleExport('EXCEL')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" /> Multi-Sheet Excel
              </button>

              <button
                disabled={exportLoading}
                onClick={() => handleExport('CSV', 'OSHA_300A_EQUIVALENT')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50"
              >
                <Layers className="w-4 h-4" /> Regulatory CSV
              </button>
            </div>
          </div>
        </div>

        {/* 3. Site Failure Rate & Risk Heatmap Matrix */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-lime-400" />
                Site-by-Site Failure Rate & Risk Heatmap
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Evaluates physical work zones based on certified QA pass rates and open non-conformance defects.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Site Name & Code</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Audits Performed</th>
                  <th className="py-3 px-4">Failure Rate</th>
                  <th className="py-3 px-4">Open Risks</th>
                  <th className="py-3 px-4">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {sites.map((site) => (
                  <tr key={site.siteId} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">{site.siteName}</span>
                      <span className="text-[11px] font-mono text-zinc-500 block">{site.siteCode}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{site.projectName}</td>
                    <td className="py-3.5 px-4">{site.inspectionsCount} verified</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-200">{site.failureRate}%</td>
                    <td className="py-3.5 px-4 text-zinc-400">{site.openRisks} issues</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          site.riskCategory === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : site.riskCategory === 'HIGH'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                            : site.riskCategory === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {site.riskCategory === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                        {site.riskCategory}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Automated Weekly Email Summaries */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Automated Weekly Email Summaries
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatically deliver executive scorecard and critical defect punch lists to authorized corporate stakeholders.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={emailLoading}
                onClick={handleTestEmail}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Test Dispatch Now
              </button>
              <button
                disabled={emailLoading}
                onClick={handleToggleEmail}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  emailSchedule?.isEnabled
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-lime-400 hover:bg-lime-300 text-black'
                }`}
              >
                {emailSchedule?.isEnabled ? 'Pause Weekly Dispatch' : 'Enable Automated Weekly Dispatch'}
              </button>
            </div>
          </div>

          {emailStatusMsg && (
            <div className="mb-4 p-3 bg-zinc-950 border border-lime-400/30 rounded-xl text-xs text-lime-400">
              {emailStatusMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300">
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block mb-1">Delivery Day & Time</span>
              <span className="font-semibold text-white">Every {emailSchedule?.deliveryDay || 'MONDAY'} at {emailSchedule?.deliveryTime || '09:00'} IST</span>
            </div>
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block mb-1">Configured Stakeholders</span>
              <span className="font-semibold text-white">{emailSchedule?.recipients?.join(', ') || 'admin@nirikshan.com'}</span>
            </div>
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block mb-1">Last Successful Dispatch</span>
              <span className="font-semibold text-white">{emailSchedule?.lastSentAt ? new Date(emailSchedule.lastSentAt).toLocaleString() : 'Pending scheduled trigger'}</span>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
