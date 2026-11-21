export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'INSPECTOR';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token?: string;
  };
  errors?: Record<string, string[]>;
}
