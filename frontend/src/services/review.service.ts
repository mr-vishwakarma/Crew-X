import api from './api';

export interface ReviewQueueParams {
  page?: number;
  limit?: number;
  status?: string;
  projectId?: string;
  siteId?: string;
  priority?: string;
  search?: string;
}

export interface ReviewItem {
  id: string;
  inspectionCode: string;
  title: string;
  projectName: string;
  projectCode: string;
  siteName: string;
  siteCode: string;
  inspectorName: string;
  inspectorEmail: string;
  checklistType: string;
  status: string;
  priority: string;
  complianceScore: number;
  itemsTotal: number;
  itemsPassed: number;
  itemsFailed: number;
  evidenceCount: number;
  anomalyFlagsCount: number;
  currentRevision: number;
  submittedAt: string;
}

export interface ReviewQueueResponse {
  inspections: ReviewItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metrics: {
    pendingCount: number;
    underReviewCount: number;
    approvedCount: number;
  };
}

export const reviewService = {
  async getReviewQueue(params: ReviewQueueParams = {}): Promise<ReviewQueueResponse> {
    const res = await api.get('/reviews/queue', { params });
    return res.data.data;
  },

  async getReviewDetails(inspectionId: string) {
    const res = await api.get(`/reviews/${inspectionId}`);
    return res.data.data;
  },

  async approveInspection(inspectionId: string, supervisorFeedback?: string) {
    const res = await api.post(`/reviews/${inspectionId}/approve`, { supervisorFeedback });
    return res.data.data;
  },

  async rejectInspection(inspectionId: string, rejectionReason: string, supervisorFeedback?: string) {
    const res = await api.post(`/reviews/${inspectionId}/reject`, { rejectionReason, supervisorFeedback });
    return res.data.data;
  },

  async requestCorrection(
    inspectionId: string,
    supervisorFeedback: string,
    requestedCorrections: Array<{ questionId: string; issueDescription: string }>
  ) {
    const res = await api.post(`/reviews/${inspectionId}/request-correction`, {
      supervisorFeedback,
      requestedCorrections,
    });
    return res.data.data;
  },

  async getRevisionHistory(inspectionId: string) {
    const res = await api.get(`/reviews/${inspectionId}/history`);
    return res.data.data.revisions;
  },
};
