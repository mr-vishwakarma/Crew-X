import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { SupervisorDashboardPage } from '../pages/supervisor/SupervisorDashboardPage';
import { InspectorDashboardPage } from '../pages/inspector/InspectorDashboardPage';
import { ModulePlaceholderPage } from '../pages/common/ModulePlaceholderPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoadingScreen } from '../components/common/LoadingScreen';
import {
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
} from 'lucide-react';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen message="Connecting to Nirikshan..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user.role === 'SUPERVISOR') {
    return <Navigate to="/supervisor/dashboard" replace />;
  }
  return <Navigate to="/inspector/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* =========================================================
          ADMINISTRATOR ROUTES (11 total navigation destinations)
          ========================================================= */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Projects Management"
              role="ADMIN"
              icon={Building2}
              description="Manage infrastructure, capital development, and commercial client projects across your organization."
              features={[
                'Multi-tier project budgets & timeline tracking',
                'Geographic site assignment and zone boundaries',
                'Client governance & compliance milestones',
                'Direct supervisor delegation and project lead assignments',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sites"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Sites & Facilities"
              role="ADMIN"
              icon={MapPin}
              description="Define physical inspection boundaries, construction zones, and GPS geofenced perimeter limits."
              features={[
                'GPS polygon geofencing configuration',
                'Hazard classification and safety level tags',
                'Site supervisor assignment and contact registers',
                'Site-specific inspection checklist attachments',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/supervisors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Supervisors Provisioning"
              role="ADMIN"
              icon={UserCheck}
              description="Create and manage operations supervisors and delegate authorized project scopes."
              features={[
                'Role-based supervisor user creation and credential issuance',
                'Scope boundary assignment to specific projects',
                'Operational audit oversight and performance metrics',
                'Account activation and security policy controls',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inspectors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Inspectors Roster"
              role="ADMIN"
              icon={Users}
              description="Organization-wide inspector personnel directory, certifications, and device records."
              features={[
                'Personnel credential provisioning',
                'Field equipment and device binding',
                'Specialized certification verification (OSHA, ISO, Civil)',
                'Activity monitoring and offline sync health',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Work Order Assignments"
              role="ADMIN"
              icon={ClipboardList}
              description="Organization-wide inspection schedules, recurring maintenance cycles, and delegation logs."
              features={[
                'Automated recurring inspection schedules',
                'Priority work order generation',
                'SLA enforcement and deadline escalation triggers',
                'Multi-project assignment matrices',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/templates"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Checklist Templates Designer"
              role="ADMIN"
              icon={FileCheck2}
              description="Create, version, and publish standardized dynamic inspection checklist forms."
              features={[
                'Dynamic section builder with conditional logic',
                'Field question types (Pass/Fail, Numeric, Photo Required, Signature)',
                'ISO-9001 / ISO-45001 compliance standards mapping',
                'Version control and seamless offline distribution',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inspections"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Organization Inspections"
              role="ADMIN"
              icon={CheckCircle2}
              description="Complete historical and active audit records with GPS verification and tamper-proof evidence."
              features={[
                'Master inspection record search and filtering',
                'GPS coordinate and timestamp verification audit trail',
                'High-resolution photo evidence viewer',
                'Automated PDF certificate and report generation',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Executive Reports & Compliance"
              role="ADMIN"
              icon={BarChart3}
              description="High-level analytics, safety trend charts, and compliance exports for regulatory bodies."
              features={[
                'Executive compliance scorecard generation',
                'Site failure rate and risk heatmaps',
                'Export to PDF, Excel, and regulatory CSV formats',
                'Automated weekly email summaries to stakeholders',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sync"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Sync Monitoring"
              role="ADMIN"
              icon={RefreshCw}
              description="Monitor synchronization queues, network health, and conflict trends across field devices."
              features={[
                'Real-time device sync status monitor',
                'Offline queue health across mobile fleet',
                'Bandwidth optimization metrics',
                'Conflict resolution oversight',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModulePlaceholderPage
              moduleName="Organization Settings"
              role="ADMIN"
              icon={Settings}
              description="Company profile, enterprise branding, security policies, and session configurations."
              features={[
                'Organization profile and branding customization',
                'Security policy & password complexity rules',
                'Session timeout and JWT expiration policies',
                'Webhook and external ERP integrations',
              ]}
            />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          SUPERVISOR ROUTES (9 total navigation destinations)
          ========================================================= */}
      <Route
        path="/supervisor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <SupervisorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/projects"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="My Assigned Projects"
              role="SUPERVISOR"
              icon={Building2}
              description="View progress, milestone status, and team assignments for your authorized project scope."
              features={[
                'Restricted project view (authorized scope only)',
                'Site progress and milestone completion tracking',
                'Inspector resource allocation per project site',
                'Project-level safety compliance rates',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/sites"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Assigned Project Sites"
              role="SUPERVISOR"
              icon={MapPin}
              description="Monitor active site zones, inspection schedules, and field access logs within your projects."
              features={[
                'Zone hazard alerts and field access controls',
                'Daily inspection rosters per site',
                'Supervisor sign-off on site safety clearance',
                'GPS inspection check-in verification',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/inspectors"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Field Inspectors Team"
              role="SUPERVISOR"
              icon={Users}
              description="Manage inspector rosters assigned to your projects and monitor daily inspection throughput."
              features={[
                'Assign inspectors to specific project zones',
                'Live inspector field status and task progress',
                'Workload balancing and daily capacity tracking',
                'Performance reviews and QA feedback logs',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/assignments"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Inspection Assignments"
              role="SUPERVISOR"
              icon={ClipboardList}
              description="Delegate work orders, assign inspection checklists, and set due dates for team inspectors."
              features={[
                'Create single and bulk inspection tasks',
                'Assign specific checklist templates to inspectors',
                'Set priority levels (Routine, Medium, Urgent, Safety Critical)',
                'Track assignment completion status in real time',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/inspections"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Project Inspections"
              role="SUPERVISOR"
              icon={CheckCircle2}
              description="Track ongoing and completed inspections across your assigned sites."
              features={[
                'Filtered inspection stream for authorized sites',
                'Checklist answer review and photo evidence inspection',
                'Defect rectification tracking and follow-up work orders',
                'Timestamp and GPS audit trail validation',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/conflicts"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Conflict Resolution"
              role="SUPERVISOR"
              icon={AlertTriangle}
              description="Resolve synchronization clashes, conflicting offline edits, and flagged inspection anomalies."
              features={[
                'Side-by-side inspection record diff viewer',
                'Field revision vs. server revision comparison',
                'Manual merge or authoritative version selection',
                'Audit logging of supervisor resolution decisions',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/reports"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Submissions & QA Reviews"
              role="SUPERVISOR"
              icon={BarChart3}
              description="Review submitted field inspection records, approve quality standards, and generate site reports."
              features={[
                'Pending review queue with 1-click approval or rejection',
                'Feedback and correction request workflow for inspectors',
                'Site-level compliance summary reports',
                'Export approved audits to client-facing PDFs',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/sync"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Team Sync Status"
              role="SUPERVISOR"
              icon={RefreshCw}
              description="Track sync progress of inspectors working in low-connectivity areas of your sites."
              features={[
                'Device sync status for assigned team members',
                'Pending sync backlog alerts for remote sites',
                'Last successful cloud synchronization timestamp',
                'Assisted manual sync trigger options',
              ]}
            />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          INSPECTOR ROUTES (7 total navigation destinations)
          ========================================================= */}
      <Route
        path="/inspector/dashboard"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <InspectorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/inspections"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <ModulePlaceholderPage
              moduleName="My Inspections"
              role="INSPECTOR"
              icon={ClipboardList}
              description="View your scheduled, active, and completed field inspection work orders."
              features={[
                'Offline access to assigned inspection forms',
                'Filter by Due Date, Site, Priority, or Status',
                'One-touch checklist launch in field conditions',
                'Automatic local caching in NirikshanLocalDB',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/checklist"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <ModulePlaceholderPage
              moduleName="Offline Checklist Form"
              role="INSPECTOR"
              icon={FileCheck2}
              description="Interactive field inspection form with local auto-save, validation, and photo attachment."
              features={[
                'Instant auto-save to IndexedDB as you type',
                'Single-tap Yes/No/NA compliance answers',
                'Mandatory photo attachment enforcement for defects',
                'Offline GPS coordinate stamp capture',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/evidence"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <ModulePlaceholderPage
              moduleName="Photo & Evidence Gallery"
              role="INSPECTOR"
              icon={Camera}
              description="Capture, annotate, and organize field observation photographs with GPS stamping."
              features={[
                'Direct mobile camera integration and photo capture',
                'Local Blob storage in Dexie.js (zero base64 overhead)',
                'Photo annotation, defect marking & timestamp watermark',
                'Automatic compression for bandwidth-efficient sync',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/sync"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <ModulePlaceholderPage
              moduleName="Sync Centre"
              role="INSPECTOR"
              icon={RefreshCw}
              description="Manage local drafts, monitor pending sync queues, and upload records when connected."
              features={[
                'Visual count of items pending upload in IndexedDB',
                'Auto-sync triggered whenever internet connectivity returns',
                'Manual "Sync Now" button with progress indicator',
                'Offline conflict warnings and resolution status',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/reports"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <ModulePlaceholderPage
              moduleName="Personal Inspection History"
              role="INSPECTOR"
              icon={BarChart3}
              description="Review your historical completed inspections, submission receipts, and supervisor approvals."
              features={[
                'Personal inspection history and completion receipts',
                'Supervisor review comments and approval status',
                'Personal performance scorecard and audits count',
                'Local search across historical records',
              ]}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/profile"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <ModulePlaceholderPage
              moduleName="Inspector Profile & Device"
              role="INSPECTOR"
              icon={UserCircle}
              description="View your inspector credentials, certifications, device registration, and local storage usage."
              features={[
                'Inspector ID card and credential details',
                'Active site access badges and OSHA certifications',
                'Browser storage quota & IndexedDB usage statistics',
                'Device offline persistence diagnostics',
              ]}
            />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized 403 Page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 404 Catch-All Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
