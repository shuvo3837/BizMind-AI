import express from 'express';
import { queryAIChat, getAIRecommendations } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, queryAIChat);
router.get('/recommendations', protect, getAIRecommendations);

export default router;
