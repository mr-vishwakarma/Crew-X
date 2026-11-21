export interface AssignedSupervisorItem {
  assignmentId: string;
  supervisor: {
    id: string;
    fullName: string;
    email: string;
    employeeId?: string;
    phone?: string;
  } | null;
  assignedAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface AvailableUserItem {
  id: string;
  fullName: string;
  email: string;
  employeeId?: string;
  phone?: string;
}

export interface ProjectSupervisorsResponse {
  assigned: AssignedSupervisorItem[];
  available: AvailableUserItem[];
}

export interface AssignedInspectorItem {
  assignmentId: string;
  assignedAt: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'REVOKED';
  inspector: {
    id: string;
    fullName: string;
    email: string;
    employeeId?: string;
    phone?: string;
  } | null;
  assignedBy?: {
    fullName: string;
    email: string;
  } | null;
}

export interface SiteInspectorsResponse {
  site: {
    id: string;
    siteName: string;
    siteCode: string;
    status: string;
    project?: any;
  };
  assigned: AssignedInspectorItem[];
  history: Array<{
    assignmentId: string;
    assignedAt: string;
    revokedAt?: string;
    status: string;
    inspector: {
      id: string;
      fullName: string;
      email: string;
    } | null;
  }>;
  available: AvailableUserItem[];
}

export interface AssignInspectorPayload {
  inspectorId: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
}

export interface SupervisorProject {
  id: string;
  projectName: string;
  projectCode: string;
  description?: string;
  industry?: string;
  clientName?: string;
  startDate: string;
  expectedEndDate: string;
  status: string;
  priority: string;
  location?: string;
  sitesCount: number;
  activeInspectorsCount: number;
  supervisors?: Array<{
    _id?: string;
    id?: string;
    fullName: string;
    email: string;
  }>;
  createdAt: string;
}

export interface SupervisorSite {
  id: string;
  siteName: string;
  siteCode: string;
  siteType: string;
  address: string;
  city?: string;
  state?: string;
  status: string;
  project?: {
    id: string;
    projectName: string;
    projectCode: string;
  } | null;
  assignedInspectors: AssignedInspectorItem[];
  assignedInspectorsCount: number;
  createdAt: string;
}

export interface InspectorAssignedSite {
  assignmentId: string;
  assignedAt: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  status: string;
  site: {
    id: string;
    siteName: string;
    siteCode: string;
    siteType: string;
    address: string;
    city?: string;
    state?: string;
    status: string;
    latitude?: number;
    longitude?: number;
  };
  project?: {
    id: string;
    projectName: string;
    projectCode: string;
    clientName?: string;
  } | null;
  assigningSupervisor?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface AdminMatrixProject {
  id: string;
  projectName: string;
  projectCode: string;
  status: string;
  supervisors: Array<{
    id?: string;
    _id?: string;
    fullName: string;
    email: string;
    employeeId?: string;
  }>;
  sites: Array<{
    id: string;
    siteName: string;
    siteCode: string;
    status: string;
    assignedInspectors: Array<{
      assignmentId: string;
      inspector?: {
        fullName: string;
        email: string;
        employeeId?: string;
      };
      supervisor?: {
        fullName: string;
        email: string;
      };
      assignedAt: string;
    }>;
  }>;
}

export interface AdminAssignmentsOverviewResponse {
  matrix: AdminMatrixProject[];
  stats: {
    totalProjects: number;
    projectsWithSupervisors: number;
    projectsWithoutSupervisors: number;
    totalSites: number;
    sitesWithInspectors: number;
    sitesWithoutInspectors: number;
    activeSiteAssignmentsCount: number;
  };
}
