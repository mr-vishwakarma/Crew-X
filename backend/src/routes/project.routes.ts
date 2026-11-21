import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  assignSupervisorsSchema,
} from '../schemas/phase3.schema.js';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'SUPERVISOR']), ProjectController.listProjects);
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validateBody(createProjectSchema),
  ProjectController.createProject
);

router.get('/:id', authenticate, authorize(['ADMIN', 'SUPERVISOR']), ProjectController.getProjectById);
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateBody(updateProjectSchema),
  ProjectController.updateProject
);
router.patch('/:id/archive', authenticate, authorize(['ADMIN']), ProjectController.archiveProject);

router.get(
  '/:id/supervisors',
  authenticate,
  authorize(['ADMIN']),
  ProjectController.getProjectSupervisors
);
router.put(
  '/:id/supervisors',
  authenticate,
  authorize(['ADMIN']),
  validateBody(assignSupervisorsSchema),
  ProjectController.assignSupervisors
);

export default router;
