import { Router } from 'express';
import { InspectionController } from '../controllers/inspection.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Sync offline inspection to cloud (Inspector & Admin)
router.post(
  '/sync',
  authenticate,
  authorize(['INSPECTOR', 'ADMIN']),
  InspectionController.syncInspection
);

// Get my inspections
router.get(
  '/my-inspections',
  authenticate,
  authorize(['INSPECTOR', 'ADMIN']),
  InspectionController.getMyInspections
);

export default router;
