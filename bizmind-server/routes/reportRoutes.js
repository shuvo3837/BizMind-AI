import express from 'express';
import { generateReport, getReportsList } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateReport);
router.get('/list', protect, getReportsList);

export default router;
