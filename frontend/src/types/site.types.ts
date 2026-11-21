export type SiteType =
  | 'CONSTRUCTION'
  | 'MANUFACTURING'
  | 'AGRICULTURE'
  | 'INFRASTRUCTURE'
  | 'WAREHOUSE'
  | 'OTHER';

export type SiteStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'COMPLETED';

export interface Site {
  id: string;
  _id?: string;
  organizationId: string;
  projectId:
    | string
    | {
        id?: string;
        _id?: string;
        projectName: string;
        projectCode: string;
        status?: string;
        priority?: string;
      };
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
  createdBy?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SitesResponse {
  sites: Site[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
