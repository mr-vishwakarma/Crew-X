import { apiClient } from './api';

export interface AdminSummaryData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSites: number;
  activeSites: number;
  totalSupervisors: number;
  totalInspectors: number;
  activeInspections: number;
  pendingReviews: number;
  overdueInspections: number;
  complianceRate: number;
}

export interface TrendPoint {
  date: string;
  created: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface ProjectPerformanceItem {
  id: string;
  projectName: string;
  projectCode: string;
  status: string;
  sitesCount: number;
  totalInspections: number;
  completedInspections: number;
  overdueCount: number;
  progress: number;
  complianceRate: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  entity: string;
  actor: string;
  timestamp: string;
  status: string;
  statusTone: 'emerald' | 'rose' | 'lime' | 'blue' | 'amber';
}

export interface AttentionItem {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  actionLabel: string;
  link: string;
}

export interface SupervisorSummaryData {
  assignedProjectsCount: number;
  managedSitesCount: number;
  managedInspectorsCount: number;
  activeAssignmentsCount: number;
  dueTodayCount: number;
  pendingReviewsCount: number;
  overdueCount: number;
  pendingSyncIssues: number;
}

export interface ReviewQueueItem {
  id: string;
  code: string;
  title: string;
  siteName: string;
  projectName: string;
  inspectorName: string;
  checklistType: string;
  submissionTime: string;
  status: string;
  complianceScore: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface InspectorSummaryData {
  assignedInspections: number;
  dueToday: number;
  inProgress: number;
  draftInspections: number;
  completedInspections: number;
  overdue: number;
  pendingSync: number;
}

export interface InspectorTaskItem {
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
}

export interface SearchResultItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const dashboardService = {
  // Admin
  async getAdminSummary(): Promise<AdminSummaryData> {
    const res = await apiClient.get<{ success: boolean; data: AdminSummaryData }>('/dashboard/admin/summary');
    return res.data.data;
  },

  async getAdminTrends(days = 30): Promise<{ points: TrendPoint[]; range: string }> {
    const res = await apiClient.get<{ success: boolean; data: { points: TrendPoint[]; range: string } }>(
      `/dashboard/admin/inspection-trends?days=${days}`
    );
    return res.data.data;
  },

  async getAdminProjectPerformance(): Promise<ProjectPerformanceItem[]> {
    const res = await apiClient.get<{ success: boolean; data: ProjectPerformanceItem[] }>(
      '/dashboard/admin/project-performance'
    );
    return res.data.data;
  },

  async getAdminRecentActivity(): Promise<ActivityItem[]> {
    const res = await apiClient.get<{ success: boolean; data: ActivityItem[] }>(
      '/dashboard/admin/recent-activity'
    );
    return res.data.data;
  },

  async getAdminAttentionRequired(): Promise<AttentionItem[]> {
    const res = await apiClient.get<{ success: boolean; data: AttentionItem[] }>(
      '/dashboard/admin/attention-required'
    );
    return res.data.data;
  },

  // Supervisor
  async getSupervisorSummary(): Promise<SupervisorSummaryData> {
    const res = await apiClient.get<{ success: boolean; data: SupervisorSummaryData }>(
      '/dashboard/supervisor/summary'
    );
    return res.data.data;
  },

  async getSupervisorReviewQueue(): Promise<ReviewQueueItem[]> {
    const res = await apiClient.get<{ success: boolean; data: ReviewQueueItem[] }>(
      '/dashboard/supervisor/review-queue'
    );
    return res.data.data;
  },

  // Inspector
  async getInspectorSummary(): Promise<InspectorSummaryData> {
    const res = await apiClient.get<{ success: boolean; data: InspectorSummaryData }>(
      '/dashboard/inspector/summary'
    );
    return res.data.data;
  },

  async getInspectorMyInspections(): Promise<InspectorTaskItem[]> {
    const res = await apiClient.get<{ success: boolean; data: InspectorTaskItem[] }>(
      '/dashboard/inspector/my-inspections'
    );
    return res.data.data;
  },

  // Global Search & Notifications
  async search(query: string): Promise<SearchResultItem[]> {
    const res = await apiClient.get<{ success: boolean; data: { results: SearchResultItem[] } }>(
      `/dashboard/search?q=${encodeURIComponent(query)}`
    );
    return res.data.data.results;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const res = await apiClient.get<{ success: boolean; data: NotificationItem[] }>(
      '/dashboard/notifications'
    );
    return res.data.data;
  },
};
