import { Router } from 'express';
import { SiteController } from '../controllers/site.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createSiteSchema, updateSiteSchema } from '../schemas/phase3.schema.js';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'SUPERVISOR']), SiteController.listSites);
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validateBody(createSiteSchema),
  SiteController.createSite
);

router.get('/:id', authenticate, authorize(['ADMIN', 'SUPERVISOR']), SiteController.getSiteById);
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateBody(updateSiteSchema),
  SiteController.updateSite
);
router.patch('/:id/archive', authenticate, authorize(['ADMIN']), SiteController.archiveSite);

export default router;
