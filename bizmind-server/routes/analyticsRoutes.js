import express from 'express';
import {
  getSummary,
  getRevenueTrend,
  getCategoryPerformance,
  getTopProducts,
  getInventoryAnalytics,
  getBusinessInsights,
  getDashboardAnalytics,
  getDeepAnalytics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, getSummary);
router.get('/revenue-trend', protect, getRevenueTrend);
router.get('/category-performance', protect, getCategoryPerformance);
router.get('/top-products', protect, getTopProducts);
router.get('/inventory', protect, getInventoryAnalytics);
router.get('/insights', protect, getBusinessInsights);
router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/deep', protect, getDeepAnalytics);

export default router;
