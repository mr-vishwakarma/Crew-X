import { apiClient } from './api';
import type {
  ManagedUser,
  CreateUserPayload,
  UpdateUserPayload,
  UsersListResponse,
} from '../types/user.types';

export const userService = {
  // Supervisors
  async listSupervisors(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
  }): Promise<{ supervisors: ManagedUser[]; pagination: UsersListResponse['pagination'] }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive) searchParams.set('isActive', params.isActive);

    const query = searchParams.toString();
    const url = `/users/supervisors${query ? `?${query}` : ''}`;
    const res = await apiClient.get<{
      success: boolean;
      data: { supervisors: ManagedUser[]; pagination: UsersListResponse['pagination'] };
    }>(url);
    return res.data.data;
  },

  async createSupervisor(payload: CreateUserPayload): Promise<ManagedUser> {
    const res = await apiClient.post<{ success: boolean; data: ManagedUser }>(
      '/users/supervisors',
      payload
    );
    return res.data.data;
  },

  async getSupervisor(id: string): Promise<{
    supervisor: ManagedUser;
    assignedProjects: Array<{
      assignmentId: string;
      assignedAt: string;
      status: string;
      project: any;
    }>;
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        supervisor: ManagedUser;
        assignedProjects: Array<{
          assignmentId: string;
          assignedAt: string;
          status: string;
          project: any;
        }>;
      };
    }>(`/users/supervisors/${id}`);
    return res.data.data;
  },

  async updateSupervisor(id: string, payload: UpdateUserPayload): Promise<ManagedUser> {
    const res = await apiClient.patch<{ success: boolean; data: ManagedUser }>(
      `/users/supervisors/${id}`,
      payload
    );
    return res.data.data;
  },

  async toggleSupervisorStatus(id: string, isActive: boolean): Promise<ManagedUser> {
    const res = await apiClient.patch<{ success: boolean; data: ManagedUser }>(
      `/users/supervisors/${id}/status`,
      { isActive }
    );
    return res.data.data;
  },

  // Inspectors
  async listInspectors(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
  }): Promise<{ inspectors: ManagedUser[]; pagination: UsersListResponse['pagination'] }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive) searchParams.set('isActive', params.isActive);

    const query = searchParams.toString();
    const url = `/users/inspectors${query ? `?${query}` : ''}`;
    const res = await apiClient.get<{
      success: boolean;
      data: { inspectors: ManagedUser[]; pagination: UsersListResponse['pagination'] };
    }>(url);
    return res.data.data;
  },

  async createInspector(payload: CreateUserPayload): Promise<ManagedUser> {
    const res = await apiClient.post<{ success: boolean; data: ManagedUser }>(
      '/users/inspectors',
      payload
    );
    return res.data.data;
  },

  async getInspector(id: string): Promise<{
    inspector: ManagedUser;
    assignedSites: Array<{
      assignmentId: string;
      assignedAt: string;
      status: string;
      site: any;
      project: any;
      supervisor: any;
    }>;
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        inspector: ManagedUser;
        assignedSites: Array<{
          assignmentId: string;
          assignedAt: string;
          status: string;
          site: any;
          project: any;
          supervisor: any;
        }>;
      };
    }>(`/users/inspectors/${id}`);
    return res.data.data;
  },

  async updateInspector(id: string, payload: UpdateUserPayload): Promise<ManagedUser> {
    const res = await apiClient.patch<{ success: boolean; data: ManagedUser }>(
      `/users/inspectors/${id}`,
      payload
    );
    return res.data.data;
  },

  async toggleInspectorStatus(id: string, isActive: boolean): Promise<ManagedUser> {
    const res = await apiClient.patch<{ success: boolean; data: ManagedUser }>(
      `/users/inspectors/${id}/status`,
      { isActive }
    );
    return res.data.data;
  },
};
