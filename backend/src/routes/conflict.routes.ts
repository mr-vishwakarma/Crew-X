import { Router } from 'express';
import { ConflictController } from '../controllers/conflict.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, authorize(['SUPERVISOR', 'ADMIN']));

router.get('/', ConflictController.listConflicts);
router.get('/:id', ConflictController.getConflictDetails);
router.get('/:id/diff', ConflictController.getConflictDiff);
router.post('/:id/resolve', ConflictController.resolveConflict);
router.post('/:id/request-correction', ConflictController.requestCorrection);
router.get('/:id/history', ConflictController.getHistory);

export default router;
