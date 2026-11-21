import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { updateOrganizationSchema } from '../schemas/phase3.schema.js';

const router = Router();

router.get('/me', authenticate, authorize(['ADMIN', 'SUPERVISOR']), OrganizationController.getOrganization);
router.put(
  '/me',
  authenticate,
  authorize(['ADMIN']),
  validateBody(updateOrganizationSchema),
  OrganizationController.updateOrganization
);
router.get(
  '/dashboard-stats',
  authenticate,
  authorize(['ADMIN', 'SUPERVISOR']),
  OrganizationController.getDashboardStats
);

export default router;
