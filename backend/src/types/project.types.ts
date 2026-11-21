export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SiteType =
  | 'CONSTRUCTION'
  | 'MANUFACTURING'
  | 'AGRICULTURE'
  | 'INFRASTRUCTURE'
  | 'WAREHOUSE'
  | 'OTHER';

export type SiteStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'COMPLETED';

export interface IOrganization {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProject {
  _id?: string;
  organizationId: string;
  projectName: string;
  projectCode: string;
  description?: string;
  industry?: string;
  clientName?: string;
  projectManager?: string;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  status: ProjectStatus;
  priority: ProjectPriority;
  location?: string;
  assignedSupervisors: string[];
  createdBy: string;
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISite {
  _id?: string;
  organizationId: string;
  projectId: string;
  siteName: string;
  siteCode: string;
  description?: string;
  siteType: SiteType;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  siteManager?: string;
  status: SiteStatus;
  createdBy: string;
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
