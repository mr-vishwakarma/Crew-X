import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import organizationRoutes from './organization.routes.js';
import projectRoutes from './project.routes.js';
import siteRoutes from './site.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/projects', projectRoutes);
router.use('/sites', siteRoutes);
router.use('/', healthRoutes);

export default router;
