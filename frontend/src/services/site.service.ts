import { apiClient } from './api';
import type { Site, SitesResponse } from '../types/site.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SiteFilterParams {
  search?: string;
  projectId?: string;
  siteType?: string;
  status?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

export const siteService = {
  async getSites(params: SiteFilterParams = {}): Promise<SitesResponse> {
    const response = await apiClient.get<ApiResponse<SitesResponse>>('/sites', {
      params,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch sites');
    }
    return response.data.data;
  },

  async getSite(id: string): Promise<Site> {
    const response = await apiClient.get<ApiResponse<Site>>(`/sites/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch site details');
    }
    return response.data.data;
  },

  async createSite(data: Partial<Site>): Promise<Site> {
    const response = await apiClient.post<ApiResponse<Site>>('/sites', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create site');
    }
    return response.data.data;
  },

  async updateSite(id: string, data: Partial<Site>): Promise<Site> {
    const response = await apiClient.put<ApiResponse<Site>>(`/sites/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update site');
    }
    return response.data.data;
  },

  async archiveSite(id: string): Promise<Site> {
    const response = await apiClient.patch<ApiResponse<Site>>(`/sites/${id}/archive`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to archive site');
    }
    return response.data.data;
  },
};
