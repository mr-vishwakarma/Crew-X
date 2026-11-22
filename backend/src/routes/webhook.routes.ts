import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Public webhook endpoint for Razorpay (verified via HMAC-SHA256 signature)
router.post('/razorpay', WebhookController.handleRazorpayWebhook);

export default router;
