import express from 'express';
import { generateReport, getReportsList, downloadReportPDF, deleteReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateReport);
router.post('/', protect, generateReport);
router.get('/list', protect, getReportsList);
router.get('/', protect, getReportsList);
router.get('/:id/download', downloadReportPDF);
router.delete('/:id', protect, deleteReport);

export default router;
