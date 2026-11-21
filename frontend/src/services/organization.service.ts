import { apiClient } from './api';
import type { Organization, DashboardStats } from '../types/organization.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const organizationService = {
  async getOrganization(): Promise<Organization> {
    const response = await apiClient.get<ApiResponse<Organization>>('/organization/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch organization details');
    }
    return response.data.data;
  },

  async updateOrganization(data: Partial<Organization>): Promise<Organization> {
    const response = await apiClient.put<ApiResponse<Organization>>('/organization/me', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update organization details');
    }
    return response.data.data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/organization/dashboard-stats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
    }
    return response.data.data;
  },
};
