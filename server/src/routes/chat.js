import { Router } from 'express';
import { startSession, sendMessage, getHistory, saveLead } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.use(authenticate);
router.post('/session', startSession);
router.post('/message', chatLimiter, sendMessage);
router.get('/history/:sessionId', getHistory);
router.post('/lead', saveLead);
export default router;
