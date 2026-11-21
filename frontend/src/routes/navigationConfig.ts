import {
  LayoutDashboard,
  Building2,
  MapPin,
  UserCheck,
  Users,
  ClipboardList,
  FileCheck2,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Settings,
  AlertTriangle,
  Camera,
  UserCircle,
  Home,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../types/auth.types';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: 'blue' | 'amber' | 'emerald' | 'red';
  description?: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Executive organization overview and metrics',
  },
  {
    id: 'admin-projects',
    label: 'Projects',
    path: '/admin/projects',
    icon: Building2,
    description: 'Manage capital infrastructure and client projects',
  },
  {
    id: 'admin-sites',
    label: 'Sites',
    path: '/admin/sites',
    icon: MapPin,
    description: 'Manage geographical sites and construction facilities',
  },
  {
    id: 'admin-supervisors',
    label: 'Supervisors',
    path: '/admin/supervisors',
    icon: UserCheck,
    description: 'Provision and assign operations supervisors',
  },
  {
    id: 'admin-inspectors',
    label: 'Inspectors',
    path: '/admin/inspectors',
    icon: Users,
    description: 'Manage field inspection personnel across organization',
  },
  {
    id: 'admin-assignments',
    label: 'Assignments',
    path: '/admin/assignments',
    icon: ClipboardList,
    description: 'Work order and site delegation schedules',
  },
  {
    id: 'admin-templates',
    label: 'Checklist Templates',
    path: '/admin/templates',
    icon: FileCheck2,
    description: 'Design standard operating procedure audit checklists',
  },
  {
    id: 'admin-inspections',
    label: 'Inspections',
    path: '/admin/inspections',
    icon: CheckCircle2,
    description: 'Organization-wide inspection audits and records',
  },
  {
    id: 'admin-reports',
    label: 'Reports',
    path: '/admin/reports',
    icon: BarChart3,
    description: 'Compliance metrics, executive analytics & exports',
  },
  {
    id: 'admin-sync',
    label: 'Sync Monitoring',
    path: '/admin/sync',
    icon: RefreshCw,
    description: 'Offline sync queues and device connectivity health',
  },
  {
    id: 'admin-settings',
    label: 'Organization Settings',
    path: '/admin/settings',
    icon: Settings,
    description: 'Company profile, security policies & preferences',
  },
];

export const SUPERVISOR_NAV_ITEMS: NavItem[] = [
  {
    id: 'sup-dashboard',
    label: 'Dashboard',
    path: '/supervisor/dashboard',
    icon: LayoutDashboard,
    description: 'Operations overview for assigned project scope',
  },
  {
    id: 'sup-projects',
    label: 'My Projects',
    path: '/supervisor/projects',
    icon: Building2,
    description: 'View and manage authorized project sites',
  },
  {
    id: 'sup-sites',
    label: 'Sites',
    path: '/supervisor/sites',
    icon: MapPin,
    description: 'Facility access points and field zones',
  },
  {
    id: 'sup-inspectors',
    label: 'Inspectors',
    path: '/supervisor/inspectors',
    icon: Users,
    description: 'Roster of field inspectors within your team',
  },
  {
    id: 'sup-assignments',
    label: 'Assignments',
    path: '/supervisor/assignments',
    icon: ClipboardList,
    description: 'Assign inspection work orders to team inspectors',
  },
  {
    id: 'sup-inspections',
    label: 'Inspections',
    path: '/supervisor/inspections',
    icon: CheckCircle2,
    description: 'Monitor ongoing site inspections and progress',
  },
  {
    id: 'sup-conflicts',
    label: 'Conflict Resolution',
    path: '/supervisor/conflicts',
    icon: AlertTriangle,
    badge: '0',
    badgeColor: 'amber',
    description: 'Resolve synchronization clashes and flagged anomalies',
  },
  {
    id: 'sup-reports',
    label: 'Reports',
    path: '/supervisor/reports',
    icon: BarChart3,
    description: 'Review field audit submissions and QA approvals',
  },
  {
    id: 'sup-sync',
    label: 'Sync Monitoring',
    path: '/supervisor/sync',
    icon: RefreshCw,
    description: 'Field device queue status and sync anomalies',
  },
];

export const INSPECTOR_NAV_ITEMS: NavItem[] = [
  {
    id: 'insp-home',
    label: 'Home',
    path: '/inspector/dashboard',
    icon: Home,
    description: 'Field inspection portal and quick tasks',
  },
  {
    id: 'insp-inspections',
    label: 'My Inspections',
    path: '/inspector/inspections',
    icon: ClipboardList,
    description: 'Scheduled, active, and completed audit assignments',
  },
  {
    id: 'insp-checklist',
    label: 'Checklist',
    path: '/inspector/checklist',
    icon: FileCheck2,
    description: 'Active offline inspection checklist forms',
  },
  {
    id: 'insp-evidence',
    label: 'Evidence',
    path: '/inspector/evidence',
    icon: Camera,
    description: 'GPS-tagged field photos and audio observations',
  },
  {
    id: 'insp-sync',
    label: 'Sync Centre',
    path: '/inspector/sync',
    icon: RefreshCw,
    description: 'Local IndexedDB storage and cloud sync status',
  },
  {
    id: 'insp-reports',
    label: 'Reports',
    path: '/inspector/reports',
    icon: BarChart3,
    description: 'Personal inspection audit trail and submitted logs',
  },
  {
    id: 'insp-profile',
    label: 'Profile',
    path: '/inspector/profile',
    icon: UserCircle,
    description: 'Inspector credentials and field certification info',
  },
];

/**
 * Returns navigation items for the given user role
 */
export const getNavItemsForRole = (role?: UserRole): NavItem[] => {
  switch (role) {
    case 'ADMIN':
      return ADMIN_NAV_ITEMS;
    case 'SUPERVISOR':
      return SUPERVISOR_NAV_ITEMS;
    case 'INSPECTOR':
      return INSPECTOR_NAV_ITEMS;
    default:
      return [];
  }
};
