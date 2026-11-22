import api from './api';

export interface ExecutiveSummaryMetrics {
  overallComplianceScore: number;
  totalSubmittedInspections: number;
  totalApprovedInspections: number;
  failedInspections: number;
  siteFailureRate: number;
  openNonComplianceItems: number;
  criticalRiskItems: number;
  pendingReviews: number;
  overdueInspections: number;
  dataFreshness: string;
}

export interface SiteRiskHeatmapItem {
  siteId: string;
  siteName: string;
  siteCode: string;
  projectName: string;
  projectCode: string;
  inspectionsCount: number;
  failureRate: number;
  openRisks: number;
  criticalFindings: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TrendItem {
  date: string;
  submitted: number;
  approved: number;
  defects: number;
  complianceRate: number;
}

export interface EmailScheduleConfig {
  isEnabled: boolean;
  recipients: string[];
  deliveryDay: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  deliveryTime: string;
  timezone: string;
  metrics: string[];
  lastSentAt?: string;
  history?: Array<{
    sentAt: string;
    recipientCount: number;
    status: 'SUCCESS' | 'FAILED';
    summary?: string;
  }>;
}

export const reportService = {
  async getExecutiveSummary(): Promise<ExecutiveSummaryMetrics> {
    const res = await api.get('/reports/executive-summary');
    return res.data.data;
  },

  async getInspectionTrends(days: number = 30): Promise<{ periodDays: number; trendData: TrendItem[] }> {
    const res = await api.get('/reports/inspection-trends', { params: { days } });
    return res.data.data;
  },

  async getSiteRiskHeatmap(): Promise<SiteRiskHeatmapItem[]> {
    const res = await api.get('/reports/site-risk-heatmap');
    return res.data.data.sites;
  },

  async getProjectPerformance() {
    const res = await api.get('/reports/project-performance');
    return res.data.data.projects;
  },

  async createExport(format: 'PDF' | 'EXCEL' | 'CSV', profile: string = 'STANDARD') {
    const res = await api.post('/reports/exports', { format, profile });
    return res.data.data;
  },

  async listExports() {
    const res = await api.get('/reports/exports');
    return res.data.data.exports;
  },

  async getEmailSchedule(): Promise<EmailScheduleConfig> {
    const res = await api.get('/reports/email-schedule');
    return res.data.data.schedule;
  },

  async updateEmailSchedule(data: Partial<EmailScheduleConfig>) {
    const res = await api.put('/reports/email-schedule', data);
    return res.data.data.schedule;
  },

  async testSendEmail() {
    const res = await api.post('/reports/email-schedule/test-send');
    return res.data.data;
  },
};
