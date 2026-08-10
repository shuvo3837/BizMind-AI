import express from 'express';
import {
  postChatMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', postChatMessage);
router.post('/message', postChatMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
