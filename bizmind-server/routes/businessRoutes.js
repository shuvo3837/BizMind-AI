import express from 'express';
import { getBusinessProfile, updateBusinessProfile } from '../controllers/businessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getBusinessProfile);
router.get('/profile', protect, getBusinessProfile);

router.post('/', protect, updateBusinessProfile);
router.post('/profile', protect, updateBusinessProfile);

router.put('/profile', protect, updateBusinessProfile);
router.put('/:id', protect, updateBusinessProfile);

export default router;
