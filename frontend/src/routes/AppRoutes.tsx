import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { LandingPage } from '../pages/LandingPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ProjectsListPage } from '../pages/admin/projects/ProjectsListPage';
import { CreateProjectPage } from '../pages/admin/projects/CreateProjectPage';
import { ProjectDetailsPage } from '../pages/admin/projects/ProjectDetailsPage';
import { EditProjectPage } from '../pages/admin/projects/EditProjectPage';
import { SitesListPage } from '../pages/admin/sites/SitesListPage';
import { CreateSitePage } from '../pages/admin/sites/CreateSitePage';
import { SiteDetailsPage } from '../pages/admin/sites/SiteDetailsPage';
import { EditSitePage } from '../pages/admin/sites/EditSitePage';
import { OrganizationSettingsPage } from '../pages/admin/organization/OrganizationSettingsPage';
import { SupervisorsListPage } from '../pages/admin/users/SupervisorsListPage';
import { InspectorsListPage } from '../pages/admin/users/InspectorsListPage';
import { AdminAssignmentsPage } from '../pages/admin/assignments/AdminAssignmentsPage';
import { SupervisorDashboardPage } from '../pages/supervisor/SupervisorDashboardPage';
import { SupervisorProjectsPage } from '../pages/supervisor/projects/SupervisorProjectsPage';
import { SupervisorSitesPage } from '../pages/supervisor/sites/SupervisorSitesPage';
import { InspectorDashboardPage } from '../pages/inspector/InspectorDashboardPage';
import { InspectorMySitesPage } from '../pages/inspector/sites/InspectorMySitesPage';
import { InspectorMyInspectionsPage } from '../pages/inspector/inspections/InspectorMyInspectionsPage';
import { ModulePlaceholderPage } from '../pages/common/ModulePlaceholderPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import {
  FileCheck2,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Camera,
  UserCircle,
} from 'lucide-react';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

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
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
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
            <ProjectsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/new"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CreateProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ProjectDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sites"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SitesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sites/new"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CreateSitePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sites/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SiteDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sites/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditSitePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/supervisors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SupervisorsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inspectors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <InspectorsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAssignmentsPage />
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
            <OrganizationSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          SUPERVISOR ROUTES (10 total navigation destinations)
          ========================================================= */}
      <Route path="/supervisor" element={<Navigate to="/supervisor/dashboard" replace />} />
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
            <SupervisorProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/sites"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <SupervisorSitesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/inspectors"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <SupervisorSitesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/assignments"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <SupervisorSitesPage />
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
      <Route
        path="/supervisor/profile"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <ModulePlaceholderPage
              moduleName="Supervisor Profile & Settings"
              role="SUPERVISOR"
              icon={UserCircle}
              description="View your supervisor credentials, authorized project scopes, and security settings."
              features={[
                'Operational supervisor credential details',
                'Authorized project and site jurisdictions',
                'Activity audit logs and approval history',
                'Security policies and notification preferences',
              ]}
            />
          </ProtectedRoute>
        }
      />

      {/* =========================================================
          INSPECTOR ROUTES (7 total navigation destinations)
          ========================================================= */}
      <Route path="/inspector" element={<Navigate to="/inspector/dashboard" replace />} />
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
            <InspectorMyInspectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/my-sites"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <InspectorMySitesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector/sites"
        element={
          <ProtectedRoute allowedRoles={['INSPECTOR']}>
            <InspectorMySitesPage />
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
