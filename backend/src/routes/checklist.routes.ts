import { Router } from 'express';
import { ChecklistController } from '../controllers/checklist.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/templates', authenticate, ChecklistController.getTemplates);
router.get('/templates/:id', authenticate, ChecklistController.getTemplateById);

export default router;
