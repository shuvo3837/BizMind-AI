import express from 'express';
import { handleFileUpload, getUploadHistory } from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/file', protect, upload.single('file'), handleFileUpload);
router.get('/history', protect, getUploadHistory);

export default router;
