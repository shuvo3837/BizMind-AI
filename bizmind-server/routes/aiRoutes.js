import express from 'express';
import {
  queryAIChat,
  getAIRecommendations,
  getAIStatus,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/chat', queryAIChat);
router.get('/recommendations', getAIRecommendations);
router.get('/status', getAIStatus);

export default router;
