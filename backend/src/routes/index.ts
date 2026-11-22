import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import organizationRoutes from './organization.routes.js';
import projectRoutes from './project.routes.js';
import siteRoutes from './site.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import userRoutes from './user.routes.js';
import assignmentRoutes from './assignment.routes.js';
import inspectionRoutes from './inspection.routes.js';
import checklistRoutes from './checklist.routes.js';
import reviewRoutes from './review.routes.js';
import conflictRoutes from './conflict.routes.js';
import reportRoutes from './report.routes.js';
import billingRoutes from './billing.routes.js';
import webhookRoutes from './webhook.routes.js';
import { AssignmentController } from '../controllers/assignment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/organization', organizationRoutes);
router.use('/projects', projectRoutes);
router.use('/sites', siteRoutes);
router.use('/users', userRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/checklists', checklistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/conflicts', conflictRoutes);
router.use('/reports', reportRoutes);
router.use('/billing', billingRoutes);
router.use('/webhooks', webhookRoutes);

// Direct top-level aliases requested in API specifications
router.get('/supervisor/projects', authenticate, authorize(['ADMIN', 'SUPERVISOR']), AssignmentController.getSupervisorProjects);
router.get('/supervisor/sites', authenticate, authorize(['ADMIN', 'SUPERVISOR']), AssignmentController.getSupervisorSites);
router.get('/inspector/my-sites', authenticate, authorize(['INSPECTOR', 'ADMIN']), AssignmentController.getInspectorMySites);
router.get('/inspector/my-assignments', authenticate, authorize(['INSPECTOR', 'ADMIN']), AssignmentController.getInspectorMyAssignments);

router.use('/', healthRoutes);

export default router;
