import { apiClient } from './api';
import type {
  Project,
  ProjectsResponse,
  ProjectSupervisorsResponse,
} from '../types/project.types';
import type { Site } from '../types/site.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ProjectFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
}

export const projectService = {
  async getProjects(params: ProjectFilterParams = {}): Promise<ProjectsResponse> {
    const response = await apiClient.get<ApiResponse<ProjectsResponse>>('/projects', {
      params,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch projects');
    }
    return response.data.data;
  },

  async getProject(id: string): Promise<{ project: Project; sites: Site[] }> {
    const response = await apiClient.get<
      ApiResponse<{ project: Project; sites: Site[] }>
    >(`/projects/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch project details');
    }
    return response.data.data;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create project');
    }
    return response.data.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update project');
    }
    return response.data.data;
  },

  async archiveProject(id: string, force = false): Promise<Project> {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/projects/${id}/archive?force=${force}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to archive project');
    }
    return response.data.data;
  },

  async getProjectSupervisors(id: string): Promise<ProjectSupervisorsResponse> {
    const response = await apiClient.get<ApiResponse<ProjectSupervisorsResponse>>(
      `/projects/${id}/supervisors`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch project supervisors');
    }
    return response.data.data;
  },

  async assignProjectSupervisors(
    id: string,
    supervisorIds: string[]
  ): Promise<Project> {
    const response = await apiClient.put<ApiResponse<Project>>(
      `/projects/${id}/supervisors`,
      { supervisorIds }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to assign supervisors');
    }
    return response.data.data;
  },
};
