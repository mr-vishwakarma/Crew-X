export interface Organization {
  id: string;
  name: string;
  code: string;
  description?: string;
  industry?: string;
  officialEmail?: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  sites: {
    total: number;
    active: number;
    underMaintenance: number;
  };
  personnel: {
    supervisors: number;
    inspectors: number;
  };
  recentProjects: Array<{
    id?: string;
    _id?: string;
    projectName: string;
    projectCode: string;
    status: string;
    priority: string;
    location?: string;
    updatedAt: string;
  }>;
  recentSites: Array<{
    id?: string;
    _id?: string;
    siteName: string;
    siteCode: string;
    siteType: string;
    status: string;
    city?: string;
    state?: string;
    projectId?: {
      projectName: string;
      projectCode: string;
    };
    updatedAt: string;
  }>;
}
