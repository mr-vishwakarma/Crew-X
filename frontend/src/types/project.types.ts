export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SupervisorSummary {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  _id?: string;
  organizationId: string;
  projectName: string;
  projectCode: string;
  description?: string;
  industry?: string;
  clientName?: string;
  projectManager?: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  location?: string;
  assignedSupervisors?: SupervisorSummary[];
  siteCount?: number;
  createdBy?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectSupervisorsResponse {
  assigned: SupervisorSummary[];
  available: SupervisorSummary[];
}
