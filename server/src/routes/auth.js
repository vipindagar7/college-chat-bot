import { Router } from 'express';
import { sendOtpHandler, verifyOtpHandler } from '../controllers/authController.js';
import { otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.post('/send-otp', otpLimiter, sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
export default router;
