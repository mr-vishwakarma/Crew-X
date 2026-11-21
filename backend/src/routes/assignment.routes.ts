import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Admin: Project-Supervisor assignments
router.put('/projects/:projectId/supervisors', authorize(['ADMIN']), AssignmentController.assignSupervisorsToProject);
router.get('/projects/:projectId/supervisors', authorize(['ADMIN']), AssignmentController.getProjectSupervisors);
router.get('/admin/overview', authorize(['ADMIN']), AssignmentController.getAdminAssignmentsOverview);

// Supervisor / Admin: Site-Inspector assignments
router.get('/sites/:siteId/inspectors', authorize(['ADMIN', 'SUPERVISOR']), AssignmentController.getSiteInspectors);
router.post('/sites/:siteId/inspectors', authorize(['ADMIN', 'SUPERVISOR']), AssignmentController.assignInspectorToSite);
router.patch('/sites/:siteId/inspectors/:assignmentId/revoke', authorize(['ADMIN', 'SUPERVISOR']), AssignmentController.revokeInspectorFromSite);

// Supervisor: Projects and Sites
router.get('/supervisor/projects', authorize(['ADMIN', 'SUPERVISOR']), AssignmentController.getSupervisorProjects);
router.get('/supervisor/sites', authorize(['ADMIN', 'SUPERVISOR']), AssignmentController.getSupervisorSites);

// Inspector: My Sites and My Assignments
router.get('/inspector/my-sites', authorize(['INSPECTOR', 'ADMIN']), AssignmentController.getInspectorMySites);
router.get('/inspector/my-assignments', authorize(['INSPECTOR', 'ADMIN']), AssignmentController.getInspectorMyAssignments);

export default router;
