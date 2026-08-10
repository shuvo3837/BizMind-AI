import express from 'express';
import {
  generateReport,
  getReportsList,
  getReportById,
  deleteReport,
  downloadReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateReport);
router.get('/list', getReportsList);
router.get('/', getReportsList);
router.get('/:id/download', downloadReport);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

export default router;
