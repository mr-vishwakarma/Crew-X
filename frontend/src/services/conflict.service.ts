import api from './api';

export interface ConflictItem {
  _id: string;
  operationId: string;
  inspectionId: string;
  inspectionCode: string;
  projectId: { _id: string; projectName: string; projectCode: string };
  siteId: { _id: string; siteName: string; siteCode: string };
  inspectorId: { _id: string; fullName: string; email: string };
  deviceId?: string;
  baseServerVersion: number;
  serverRevisionNumber: number;
  incomingRevisionNumber: number;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED' | 'DISMISSED';
  conflictingFields: Array<{
    field: string;
    questionText?: string;
    serverValue: any;
    incomingValue: any;
    resolvedValue?: any;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  resolutionChoice?: string;
  resolutionReason?: string;
  clientCapturedAt?: string;
  serverReceivedAt: string;
  createdAt: string;
}

export const conflictService = {
  async listConflicts(status?: string, projectId?: string): Promise<{ conflicts: ConflictItem[]; total: number }> {
    const res = await api.get('/conflicts', { params: { status, projectId } });
    return res.data.data;
  },

  async getConflictDetails(id: string) {
    const res = await api.get(`/conflicts/${id}`);
    return res.data.data.conflict;
  },

  async getConflictDiff(id: string) {
    const res = await api.get(`/conflicts/${id}/diff`);
    return res.data.data;
  },

  async resolveConflict(
    id: string,
    data: {
      resolutionChoice: 'ACCEPT_SERVER' | 'ACCEPT_INCOMING' | 'MANUAL_MERGE';
      resolutionReason: string;
      chosenValues?: Record<string, any>;
      rejectedValues?: Record<string, any>;
    }
  ) {
    const res = await api.post(`/conflicts/${id}/resolve`, data);
    return res.data.data;
  },

  async requestCorrection(id: string, resolutionReason: string) {
    const res = await api.post(`/conflicts/${id}/request-correction`, { resolutionReason });
    return res.data.data;
  },
};
