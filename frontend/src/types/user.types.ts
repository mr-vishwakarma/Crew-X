export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'INSPECTOR';
  organizationId: string;
  phone?: string;
  employeeId?: string;
  isActive: boolean;
  assignedProjectsCount?: number;
  assignedSitesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  employeeId?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  employeeId?: string;
}

export interface UsersListResponse {
  supervisors?: ManagedUser[];
  inspectors?: ManagedUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
