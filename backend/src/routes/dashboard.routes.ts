import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// ==========================================
// Administrator Dashboard
// ==========================================
router.get(
  '/admin/summary',
  authenticate,
  authorize(['ADMIN']),
  DashboardController.getAdminSummary
);
router.get(
  '/admin/inspection-trends',
  authenticate,
  authorize(['ADMIN']),
  DashboardController.getAdminInspectionTrends
);
router.get(
  '/admin/project-performance',
  authenticate,
  authorize(['ADMIN']),
  DashboardController.getAdminProjectPerformance
);
router.get(
  '/admin/recent-activity',
  authenticate,
  authorize(['ADMIN']),
  DashboardController.getAdminRecentActivity
);
router.get(
  '/admin/attention-required',
  authenticate,
  authorize(['ADMIN']),
  DashboardController.getAdminAttentionRequired
);

// ==========================================
// Supervisor Dashboard
// ==========================================
router.get(
  '/supervisor/summary',
  authenticate,
  authorize(['ADMIN', 'SUPERVISOR']),
  DashboardController.getSupervisorSummary
);
router.get(
  '/supervisor/review-queue',
  authenticate,
  authorize(['ADMIN', 'SUPERVISOR']),
  DashboardController.getSupervisorReviewQueue
);

// ==========================================
// Inspector Dashboard
// ==========================================
router.get(
  '/inspector/summary',
  authenticate,
  authorize(['ADMIN', 'SUPERVISOR', 'INSPECTOR']),
  DashboardController.getInspectorSummary
);
router.get(
  '/inspector/my-inspections',
  authenticate,
  authorize(['ADMIN', 'SUPERVISOR', 'INSPECTOR']),
  DashboardController.getInspectorMyInspections
);

// ==========================================
// Common Search & Notifications
// ==========================================
router.get('/search', authenticate, DashboardController.globalSearch);
router.get('/notifications', authenticate, DashboardController.getNotifications);

export default router;
