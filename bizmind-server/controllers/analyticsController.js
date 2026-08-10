import { calculateAnalytics } from '../services/analyticsService.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

const buildDateFilter = (query) => {
  const filter = {};
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  return filter;
};

const requireBusiness = (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) {
    res.status(400).json({ success: false, message: 'No business linked to this user.' });
    return null;
  }
  return businessId;
};

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  let analytics;
  try {
    analytics = await calculateAnalytics(businessId);
  } catch (err) {
    return fail(res, err.message || 'Unable to compute analytics', err.statusCode || 500);
  }

  analytics = analytics || {};
  const inventoryCount = Array.isArray(analytics.inventory) ? analytics.inventory.length : 0;
  const hasData =
    (analytics.totalSales || 0) > 0 ||
    (analytics.totalProducts || 0) > 0 ||
    inventoryCount > 0 ||
    (analytics.totalExpenses || 0) > 0;

  if (!hasData) {
    return ok(res, 'No business data available yet.', {
      hasData: false,
      kpis: null,
      charts: null,
    });
  }

  return ok(res, 'Dashboard analytics retrieved.', {
    hasData: true,
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
      revenueByCategory: analytics.revenueByCategory,
      expenseByCategory: analytics.expenseByCategory,
      topProducts: analytics.topProducts,
      revenueTrend: analytics.revenueTrend,
      profitTrend: analytics.profitTrend,
    },
    inventoryStatus: analytics.inventoryStatus,
  });
});

export const getDeepAnalytics = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  let analytics;
  try {
    analytics = await calculateAnalytics(businessId);
  } catch (err) {
    return fail(res, err.message || 'Unable to compute analytics', err.statusCode || 500);
  }
  if (!analytics) {
    return ok(res, 'No analytics available.', { hasData: false, analytics: null });
  }
  return ok(res, 'Deep analytics retrieved.', { hasData: true, analytics });
});

export const getSummary = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  let analytics;
  try {
    analytics = await calculateAnalytics(businessId);
  } catch (err) {
    return fail(res, err.message || 'Unable to compute analytics', err.statusCode || 500);
  }
  analytics = analytics || {};
  const hasData =
    (analytics.totalSales || 0) +
      (analytics.totalProducts || 0) +
      (analytics.totalExpenses || 0) >
    0;

  return ok(res, 'Summary retrieved.', {
    hasData,
    summary: {
      totalRevenue: analytics.totalRevenue || 0,
      totalProfit: analytics.totalProfit || 0,
      profitMargin: analytics.profitMargin || 0,
      totalSales: analytics.totalSales || 0,
      totalExpenses: analytics.totalExpenses || 0,
    },
  });
});

export const getRevenue = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;
  const filter = buildDateFilter(req.query);
  const sales = await Sale.find({ businessId, ...filter }).lean();
  if (!sales.length) return ok(res, 'No revenue data.', { hasData: false, totals: null, byCategory: [] });

  const total = sales.reduce((s, x) => s + (x.revenue || 0), 0);
  const byCategory = Object.values(sales.reduce((acc, x) => {
    const k = x.category || 'Uncategorized';
    acc[k] = acc[k] || { category: k, revenue: 0 };
    acc[k].revenue += x.revenue || 0;
    return acc;
  }, {}));

  return ok(res, 'Revenue retrieved.', { hasData: true, totals: { total }, byCategory });
});

export const getSales = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;
  const filter = buildDateFilter(req.query);
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const sales = await Sale.find({ businessId, ...filter }).sort({ date: -1 }).limit(limit).lean();
  return ok(res, 'Sales retrieved.', { count: sales.length, sales });
});

export const getProducts = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;
  const products = await Product.find({ businessId }).lean();
  return ok(res, 'Products retrieved.', { count: products.length, products });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;
  const filter = buildDateFilter(req.query);
  const expenses = await Expense.find({ businessId, ...filter }).lean();
  if (!expenses.length) return ok(res, 'No expense data.', { hasData: false, totals: null, byCategory: [] });

  const total = expenses.reduce((s, x) => s + (x.amount || 0), 0);
  const byCategory = Object.values(expenses.reduce((acc, x) => {
    const k = x.category || 'Other';
    acc[k] = acc[k] || { category: k, amount: 0 };
    acc[k].amount += x.amount || 0;
    return acc;
  }, {})).map((c) => ({ ...c, percentage: total > 0 ? Number(((c.amount / total) * 100).toFixed(2)) : 0 }));

  return ok(res, 'Expenses retrieved.', { hasData: true, totals: { total }, byCategory });
});

export const getInventory = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;
  const inventory = await Inventory.find({ businessId }).lean();
  return ok(res, 'Inventory retrieved.', { count: inventory.length, inventory });
});

export const getTrends = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  let analytics;
  try {
    analytics = await calculateAnalytics(businessId);
  } catch (err) {
    return fail(res, err.message || 'Unable to compute analytics', err.statusCode || 500);
  }
  analytics = analytics || {};
  return ok(res, 'Trends retrieved.', {
    revenueTrend: analytics.revenueTrend || [],
    profitTrend: analytics.profitTrend || [],
  });
});

// Aliases for legacy frontends / dashboard / inventory endpoints
export const getOverview = getDashboardAnalytics;
export const getRevenueAnalytics = getRevenue;
export const getExpenseAnalytics = getExpenses;
export const getProductAnalytics = getProducts;
export const getInventoryAnalytics = getInventory;
