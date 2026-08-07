import express from 'express';
import { getBusinessProfile, updateBusinessProfile } from '../controllers/businessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getBusinessProfile);
router.put('/profile', protect, updateBusinessProfile);

export default router;
