import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(150),
  code: z.string().min(2, 'Organization code must be at least 2 characters').max(30).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  officialEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  contactNumber: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  logoUrl: z.string().optional().or(z.literal('')),
});

export const createProjectSchema = z.object({
  projectName: z.string().min(2, 'Project name must be at least 2 characters').max(150),
  projectCode: z.string().min(2, 'Project code must be at least 2 characters').max(30),
  description: z.string().max(2000).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  clientName: z.string().max(150).optional().or(z.literal('')),
  projectManager: z.string().max(100).optional().or(z.literal('')),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid start date is required',
  }),
  expectedEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid expected end date is required',
  }),
  status: z.enum(['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  location: z.string().max(200).optional().or(z.literal('')),
  assignedSupervisors: z.array(z.string()).optional(),
}).refine(
  (data) => new Date(data.expectedEndDate) >= new Date(data.startDate),
  {
    message: 'Expected end date cannot be earlier than start date',
    path: ['expectedEndDate'],
  }
);

export const updateProjectSchema = z.object({
  projectName: z.string().min(2, 'Project name must be at least 2 characters').max(150).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  clientName: z.string().max(150).optional().or(z.literal('')),
  projectManager: z.string().max(100).optional().or(z.literal('')),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid start date is required',
  }).optional(),
  expectedEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid expected end date is required',
  }).optional(),
  actualEndDate: z.string().optional().or(z.literal('')),
  status: z.enum(['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  location: z.string().max(200).optional().or(z.literal('')),
});

export const assignSupervisorsSchema = z.object({
  supervisorIds: z.array(z.string()),
});

export const createSiteSchema = z.object({
  projectId: z.string().min(1, 'Project selection is required'),
  siteName: z.string().min(2, 'Site name must be at least 2 characters').max(150),
  siteCode: z.string().min(2, 'Site code must be at least 2 characters').max(30),
  description: z.string().max(2000).optional().or(z.literal('')),
  siteType: z.enum([
    'CONSTRUCTION',
    'MANUFACTURING',
    'AGRICULTURE',
    'INFRASTRUCTURE',
    'WAREHOUSE',
    'OTHER',
  ]).default('CONSTRUCTION'),
  address: z.string().min(3, 'Address is required').max(300),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).default('India'),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  siteManager: z.string().max(100).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'COMPLETED']).default('ACTIVE'),
});

export const updateSiteSchema = z.object({
  projectId: z.string().min(1, 'Project selection is required').optional(),
  siteName: z.string().min(2, 'Site name must be at least 2 characters').max(150).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  siteType: z.enum([
    'CONSTRUCTION',
    'MANUFACTURING',
    'AGRICULTURE',
    'INFRASTRUCTURE',
    'WAREHOUSE',
    'OTHER',
  ]).optional(),
  address: z.string().min(3, 'Address is required').max(300).optional(),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  siteManager: z.string().max(100).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'COMPLETED']).optional(),
});
