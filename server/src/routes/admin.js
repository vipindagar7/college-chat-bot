import { Router } from 'express';
import { adminLogin, createAdmin, getStats, getLeads, updateLead, getConversations, getMessages, exportLeads } from '../controllers/adminController.js';
import { getData, updateSection, getFaqs, createFaq, editFaq, removeFaq } from '../controllers/dataController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public
router.post('/login', adminLogin);
router.post('/create', createAdmin);

// Protected
router.use(authenticate, requireAdmin);
router.get('/stats', getStats);
router.get('/leads', getLeads);
router.get('/leads/export', exportLeads);   // must be BEFORE /leads/:id
router.patch('/leads/:id', updateLead);
router.get('/conversations', getConversations);
router.get('/conversations/:sessionId', getMessages);

// Data management
router.get('/data', getData);
router.patch('/data/:section', updateSection);
router.get('/faqs', getFaqs);
router.post('/faqs', createFaq);
router.put('/faqs/:id', editFaq);
router.delete('/faqs/:id', removeFaq);

export default router;
