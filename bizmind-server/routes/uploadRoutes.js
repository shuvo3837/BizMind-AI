import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  uploadFile,
  getUploads,
  getUploadById,
  previewFile,
  deleteUpload,
} from '../controllers/uploadController.js';

const router = express.Router();

// During the testing phase we may have BYPASS_AUTH=true. The `protect`
// middleware already checks that flag internally and injects a synthetic
// req.user, so we can keep using router.use(protect) regardless. Flipping
// BYPASS_AUTH=false later re-enables JWT enforcement with no change here.
router.use(protect);

router.post('/', upload.single('file'), uploadFile);
router.post('/preview', upload.single('file'), previewFile);
router.get('/', getUploads);
router.get('/:id', getUploadById);
router.delete('/:id', deleteUpload);

export default router;
