import express from 'express';
import {
  getDashboardAnalytics,
  getDatasetAnalytics,
  getDeepAnalytics,
  getSummary,
  getRevenue,
  getSales,
  getProducts,
  getExpenses,
  getInventory,
  getTrends,
  getOverview,
  getRevenueAnalytics,
  getExpenseAnalytics,
  getProductAnalytics,
  getInventoryAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/dashboard', getDashboardAnalytics);
router.get('/dataset/:datasetId', getDatasetAnalytics);
router.get('/deep', getDeepAnalytics);
router.get('/summary', getSummary);
router.get('/revenue', getRevenueAnalytics);
router.get('/sales', getSales);
router.get('/products', getProductAnalytics);
router.get('/expenses', getExpenseAnalytics);
router.get('/inventory', getInventoryAnalytics);
router.get('/trends', getTrends);

// Backwards-compatible aliases
router.get('/revenue-analytics', getRevenueAnalytics);
router.get('/expense-analytics', getExpenseAnalytics);
router.get('/product-analytics', getProductAnalytics);
router.get('/inventory-analytics', getInventoryAnalytics);

export default router;
