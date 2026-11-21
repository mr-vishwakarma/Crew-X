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
  FileSearch,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../types/auth.types';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeTone?: 'lime' | 'amber' | 'blue' | 'rose';
  description?: string;
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'OVERVIEW',
    items: [
      {
        id: 'admin-dashboard',
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
        description: 'Executive overview, real-time KPI metrics & trends',
      },
    ],
  },
  {
    groupName: 'OPERATIONS',
    items: [
      {
        id: 'admin-projects',
        label: 'Projects',
        path: '/admin/projects',
        icon: Building2,
        description: 'Manage infrastructure and client project packages',
      },
      {
        id: 'admin-sites',
        label: 'Sites',
        path: '/admin/sites',
        icon: MapPin,
        description: 'Geofenced facilities and construction site assets',
      },
      {
        id: 'admin-assignments',
        label: 'Assignments',
        path: '/admin/assignments',
        icon: ClipboardList,
        description: 'Field assignment matrix and supervisor dispatches',
      },
      {
        id: 'admin-inspections',
        label: 'Inspections',
        path: '/admin/inspections',
        icon: CheckCircle2,
        description: 'Organization-wide audits and verification records',
      },
    ],
  },
  {
    groupName: 'PEOPLE',
    items: [
      {
        id: 'admin-supervisors',
        label: 'Supervisors',
        path: '/admin/supervisors',
        icon: UserCheck,
        description: 'Field operations supervisors roster and jurisdiction',
      },
      {
        id: 'admin-inspectors',
        label: 'Inspectors',
        path: '/admin/inspectors',
        icon: Users,
        description: 'Field inspection workforce credentials and certs',
      },
    ],
  },
  {
    groupName: 'COMPLIANCE',
    items: [
      {
        id: 'admin-templates',
        label: 'Checklist Templates',
        path: '/admin/templates',
        icon: FileCheck2,
        description: 'Standardized ISO-9001 and OSHA safety checklist forms',
      },
      {
        id: 'admin-reports',
        label: 'Reports',
        path: '/admin/reports',
        icon: BarChart3,
        description: 'Audit trails, executive analytics and compliance exports',
      },
    ],
  },
  {
    groupName: 'SYSTEM',
    items: [
      {
        id: 'admin-sync',
        label: 'Sync Monitoring',
        path: '/admin/sync',
        icon: RefreshCw,
        description: 'Device sync telemetry, offline logs and queue health',
      },
      {
        id: 'admin-settings',
        label: 'Organization Settings',
        path: '/admin/settings',
        icon: Settings,
        description: 'Company profile, geofence radius & security policies',
      },
    ],
  },
];

export const SUPERVISOR_NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'OVERVIEW',
    items: [
      {
        id: 'sup-dashboard',
        label: 'Dashboard',
        path: '/supervisor/dashboard',
        icon: LayoutDashboard,
        description: 'Operational command for authorized project scope',
      },
    ],
  },
  {
    groupName: 'PROJECT OPERATIONS',
    items: [
      {
        id: 'sup-projects',
        label: 'My Projects',
        path: '/supervisor/projects',
        icon: Building2,
        description: 'Assigned construction projects and packages',
      },
      {
        id: 'sup-sites',
        label: 'Sites',
        path: '/supervisor/sites',
        icon: MapPin,
        description: 'Zone access points, chainages and work areas',
      },
      {
        id: 'sup-inspectors',
        label: 'Inspectors',
        path: '/supervisor/inspectors',
        icon: Users,
        description: 'Field inspection crew roster within project scope',
      },
      {
        id: 'sup-assignments',
        label: 'Assignments',
        path: '/supervisor/assignments',
        icon: ClipboardList,
        description: 'Dispatch daily work packages to inspectors',
      },
      {
        id: 'sup-inspections',
        label: 'Inspections',
        path: '/supervisor/inspections',
        icon: CheckCircle2,
        description: 'Active site inspections in progress',
      },
    ],
  },
  {
    groupName: 'QUALITY AND REVIEW',
    items: [
      {
        id: 'sup-review-queue',
        label: 'Review Queue',
        path: '/supervisor/reports',
        icon: FileSearch,
        badge: '4',
        badgeTone: 'lime',
        description: 'Submitted field audits awaiting QA sign-off',
      },
      {
        id: 'sup-conflicts',
        label: 'Conflict Resolution',
        path: '/supervisor/conflicts',
        icon: AlertTriangle,
        description: 'Resolve variance disputes and data anomalies',
      },
      {
        id: 'sup-reports',
        label: 'Reports',
        path: '/supervisor/reports',
        icon: BarChart3,
        description: 'Field compliance logs and contractor punch lists',
      },
    ],
  },
  {
    groupName: 'SYSTEM',
    items: [
      {
        id: 'sup-sync',
        label: 'Sync Monitoring',
        path: '/supervisor/sync',
        icon: RefreshCw,
        description: 'Field device queue status and offline health',
      },
      {
        id: 'sup-profile',
        label: 'Profile & Settings',
        path: '/supervisor/profile',
        icon: UserCircle,
        description: 'Supervisor credentials and notification rules',
      },
    ],
  },
];

export const INSPECTOR_NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'OVERVIEW',
    items: [
      {
        id: 'insp-home',
        label: 'Home',
        path: '/inspector/dashboard',
        icon: Home,
        description: 'Field inspection portal and immediate tasks',
      },
    ],
  },
  {
    groupName: 'FIELD OPERATIONS',
    items: [
      {
        id: 'insp-inspections',
        label: 'My Inspections',
        path: '/inspector/inspections',
        icon: ClipboardList,
        badge: '3',
        badgeTone: 'lime',
        description: 'Scheduled, active, and completed audit assignments',
      },
      {
        id: 'insp-checklist',
        label: 'Checklists',
        path: '/inspector/checklist',
        icon: FileCheck2,
        description: 'Offline-ready inspection checklist forms',
      },
      {
        id: 'insp-evidence',
        label: 'Evidence',
        path: '/inspector/evidence',
        icon: Camera,
        description: 'GPS-tagged field photos and defect markups',
      },
    ],
  },
  {
    groupName: 'OFFLINE WORK',
    items: [
      {
        id: 'insp-sync',
        label: 'Sync Centre',
        path: '/inspector/sync',
        icon: RefreshCw,
        description: 'Local IndexedDB storage and cloud sync queue',
      },
    ],
  },
  {
    groupName: 'MY RECORDS',
    items: [
      {
        id: 'insp-reports',
        label: 'Reports',
        path: '/inspector/reports',
        icon: BarChart3,
        description: 'Personal audit trail and historical logs',
      },
      {
        id: 'insp-profile',
        label: 'Profile',
        path: '/inspector/profile',
        icon: UserCircle,
        description: 'Inspector credentials and field certification',
      },
    ],
  },
];

/**
 * Returns grouped navigation for the given user role
 */
export const getNavGroupsForRole = (role?: UserRole): NavGroup[] => {
  switch (role) {
    case 'ADMIN':
      return ADMIN_NAV_GROUPS;
    case 'SUPERVISOR':
      return SUPERVISOR_NAV_GROUPS;
    case 'INSPECTOR':
      return INSPECTOR_NAV_GROUPS;
    default:
      return [];
  }
};

/**
 * Backwards compatibility helper returning flat list of items
 */
export const getNavItemsForRole = (role?: UserRole): NavItem[] => {
  const groups = getNavGroupsForRole(role);
  return groups.flatMap((g) => g.items);
};
