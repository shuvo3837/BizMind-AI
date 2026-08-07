import express from 'express';
import { registerUser, loginUser, getCurrentUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getCurrentUserProfile);

export default router;
