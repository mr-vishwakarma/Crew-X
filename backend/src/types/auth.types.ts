import { Request } from 'express';

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'INSPECTOR';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSanitized {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
