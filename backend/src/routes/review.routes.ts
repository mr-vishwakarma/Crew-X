import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All review operations require SUPERVISOR or ADMIN authentication
router.use(authenticate, authorize(['SUPERVISOR', 'ADMIN']));

router.get('/queue', ReviewController.getReviewQueue);
router.get('/:inspectionId', ReviewController.getReviewDetails);
router.post('/:inspectionId/approve', ReviewController.approveInspection);
router.post('/:inspectionId/reject', ReviewController.rejectInspection);
router.post('/:inspectionId/request-correction', ReviewController.requestCorrection);
router.get('/:inspectionId/history', ReviewController.getRevisionHistory);

export default router;
