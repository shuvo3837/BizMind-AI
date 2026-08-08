import express from 'express';
import { handleFileUpload, getUploads, getUploadById, deleteUpload } from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Primary endpoints per API specification
router.post('/', upload.single('file'), handleFileUpload);
router.get('/', getUploads);
router.get('/:id', getUploadById);
router.delete('/:id', deleteUpload);

// Compatibility aliases
router.post('/file', upload.single('file'), handleFileUpload);
router.get('/history', getUploads);

export default router;
