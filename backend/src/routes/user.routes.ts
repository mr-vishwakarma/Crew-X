import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All user management routes require authentication
router.use(authenticate);

// Supervisor management (Admin only)
router.post('/supervisors', authorize(['ADMIN']), UserController.createSupervisor);
router.get('/supervisors', authorize(['ADMIN']), UserController.listSupervisors);
router.get('/supervisors/:id', authorize(['ADMIN']), UserController.getSupervisorById);
router.patch('/supervisors/:id', authorize(['ADMIN']), UserController.updateSupervisor);
router.patch('/supervisors/:id/status', authorize(['ADMIN']), UserController.toggleSupervisorStatus);

// Inspector management (Admin can manage, Supervisor can list for assignment)
router.post('/inspectors', authorize(['ADMIN']), UserController.createInspector);
router.get('/inspectors', authorize(['ADMIN', 'SUPERVISOR']), UserController.listInspectors);
router.get('/inspectors/:id', authorize(['ADMIN', 'SUPERVISOR']), UserController.getInspectorById);
router.patch('/inspectors/:id', authorize(['ADMIN']), UserController.updateInspector);
router.patch('/inspectors/:id/status', authorize(['ADMIN']), UserController.toggleInspectorStatus);

export default router;
