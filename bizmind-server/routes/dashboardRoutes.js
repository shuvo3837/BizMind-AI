import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { calculateAnalytics } from '../services/analyticsService.js';
import Upload from '../models/Upload.js';
import ChatHistory from '../models/ChatHistory.js';
import Report from '../models/Report.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const analytics = await calculateAnalytics(businessId);
  const [recentUploads, recentChats, recentReports] = await Promise.all([
    Upload.find({ businessId }).sort({ createdAt: -1 }).limit(5).select('-filePath').lean(),
    ChatHistory.find({ businessId, userId: req.user._id }).sort({ updatedAt: -1 }).limit(3).lean(),
    Report.find({ businessId }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const hasData =
    (analytics.totalSales || 0) + (analytics.totalProducts || 0) + (analytics.totalExpenses || 0) > 0 ||
    (Array.isArray(analytics.inventoryStatus) ? analytics.inventoryStatus.length : (analytics.inventoryCount || 0)) > 0;

  return ok(res, 'Dashboard data retrieved.', {
    hasData,
    kpis: {
      totalRevenue: analytics.totalRevenue,
      totalProfit: analytics.totalProfit,
      totalCost: analytics.totalCost,
      totalSales: analytics.totalSales,
      totalUnitsSold: analytics.totalUnitsSold,
      totalProducts: analytics.totalProducts,
      totalExpenses: analytics.totalExpenses,
      totalInventoryValue: analytics.totalInventoryValue,
      profitMargin: analytics.profitMargin,
      averageOrderValue: analytics.averageOrderValue,
    },
    charts: {
      revenueByCategory: analytics.revenueByCategory || [],
      expenseByCategory: analytics.expenseByCategory || [],
      topProducts: (analytics.topProducts || []).slice(0, 5),
      revenueTrend: analytics.revenueTrend || [],
      profitTrend: analytics.profitTrend || [],
    },
    recentUploads,
    recentChats: recentChats.map((c) => ({ sessionId: c.sessionId, updatedAt: c.updatedAt, messageCount: (c.messages || []).length })),
    recentReports,
  });
}));

export default router;