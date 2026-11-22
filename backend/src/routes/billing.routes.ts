import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Organization billing administration is strictly restricted to ADMIN
router.use(authenticate, authorize(['ADMIN']));

router.get('/plans', BillingController.getPlans);
router.get('/current', BillingController.getCurrentSubscription);
router.get('/history', BillingController.getBillingHistory);
router.post('/subscriptions', BillingController.createSubscription);
router.post('/subscriptions/verify', BillingController.verifySubscription);
router.post('/subscriptions/cancel', BillingController.cancelSubscription);

export default router;
