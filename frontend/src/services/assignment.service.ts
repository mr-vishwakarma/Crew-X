import { apiClient } from './api';
import type {
  ProjectSupervisorsResponse,
  SiteInspectorsResponse,
  AssignInspectorPayload,
  SupervisorProject,
  SupervisorSite,
  InspectorAssignedSite,
  AdminAssignmentsOverviewResponse,
  AssignedInspectorItem,
} from '../types/assignment.types';

export const assignmentService = {
  // Admin: Project Supervisors
  async getProjectSupervisors(projectId: string): Promise<ProjectSupervisorsResponse> {
    const res = await apiClient.get<{ success: boolean; data: ProjectSupervisorsResponse }>(
      `/assignments/projects/${projectId}/supervisors`
    );
    return res.data.data;
  },

  async assignProjectSupervisors(
    projectId: string,
    supervisorIds: string[]
  ): Promise<{ projectId: string; projectName: string; assignedSupervisors: any[] }> {
    const res = await apiClient.put<{
      success: boolean;
      data: { projectId: string; projectName: string; assignedSupervisors: any[] };
    }>(`/assignments/projects/${projectId}/supervisors`, { supervisorIds });
    return res.data.data;
  },

  async getAdminAssignmentsOverview(): Promise<AdminAssignmentsOverviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: AdminAssignmentsOverviewResponse }>(
      '/assignments/admin/overview'
    );
    return res.data.data;
  },

  // Supervisor: Projects and Sites
  async getSupervisorProjects(): Promise<SupervisorProject[]> {
    const res = await apiClient.get<{ success: boolean; data: SupervisorProject[] }>(
      '/supervisor/projects'
    );
    return res.data.data;
  },

  async getSupervisorSites(projectId?: string): Promise<SupervisorSite[]> {
    const url = projectId ? `/supervisor/sites?projectId=${projectId}` : '/supervisor/sites';
    const res = await apiClient.get<{ success: boolean; data: SupervisorSite[] }>(url);
    return res.data.data;
  },

  // Supervisor / Admin: Site Inspectors
  async getSiteInspectors(siteId: string): Promise<SiteInspectorsResponse> {
    const res = await apiClient.get<{ success: boolean; data: SiteInspectorsResponse }>(
      `/assignments/sites/${siteId}/inspectors`
    );
    return res.data.data;
  },

  async assignInspectorToSite(
    siteId: string,
    payload: AssignInspectorPayload
  ): Promise<AssignedInspectorItem> {
    const res = await apiClient.post<{ success: boolean; data: AssignedInspectorItem }>(
      `/assignments/sites/${siteId}/inspectors`,
      payload
    );
    return res.data.data;
  },

  async revokeInspectorFromSite(
    siteId: string,
    assignmentId: string
  ): Promise<{ assignmentId: string; status: string; revokedAt: string }> {
    const res = await apiClient.patch<{
      success: boolean;
      data: { assignmentId: string; status: string; revokedAt: string };
    }>(`/assignments/sites/${siteId}/inspectors/${assignmentId}/revoke`);
    return res.data.data;
  },

  // Inspector: My Sites and My Inspections
  async getInspectorMySites(): Promise<InspectorAssignedSite[]> {
    const res = await apiClient.get<{ success: boolean; data: InspectorAssignedSite[] }>(
      '/inspector/my-sites'
    );
    return res.data.data;
  },

  async getInspectorMyAssignments(): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>(
      '/inspector/my-assignments'
    );
    return res.data.data;
  },
};
