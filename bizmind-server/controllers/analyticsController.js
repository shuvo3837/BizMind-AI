import { calculateAnalytics } from '../services/analyticsService.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Upload from '../models/Upload.js';
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

const getDatasetScopedAnalytics = async (datasetId, businessId, userId) => {
  const upload = await Upload.findOne({ _id: datasetId, businessId, userId }).lean();
  if (!upload) {
    const error = new Error('Dataset not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  const [sales, expenses, products, inventory] = await Promise.all([
    Sale.find({ businessId, userId, uploadId: datasetId }).lean(),
    Expense.find({ businessId, userId, uploadId: datasetId }).lean(),
    Product.find({ businessId, userId, uploadId: datasetId }).lean(),
    Inventory.find({ businessId, userId, uploadId: datasetId }).lean(),
  ]);

  return {
    upload,
    sales,
    expenses,
    products,
    inventory,
  };
};

export const getDatasetAnalytics = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  const datasetId = req.params.datasetId;
  if (!datasetId) return fail(res, 'Dataset ID is required.', 400);

  const scoped = await getDatasetScopedAnalytics(datasetId, businessId, req.user?._id);
  const sales = Array.isArray(scoped.sales) ? scoped.sales : [];
  const expenses = Array.isArray(scoped.expenses) ? scoped.expenses : [];
  const products = Array.isArray(scoped.products) ? scoped.products : [];
  const inventory = Array.isArray(scoped.inventory) ? scoped.inventory : [];

  const totalRevenue = sales.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0;

  return ok(res, 'Dataset analytics retrieved.', {
    success: true,
    dataset: {
      id: scoped.upload._id,
      fileName: scoped.upload.originalName,
      records: scoped.upload.recordsProcessed || sales.length,
      status: scoped.upload.status,
    },
    kpis: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalProfit,
      profitMargin,
      orders: sales.length,
      quantity: sales.reduce((sum, item) => sum + (item.quantity || 0), 0),
    },
    salesTrend: [],
    topProducts: products.slice(0, 5),
    topCategories: [],
    expenseAnalysis: [],
  });
});

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  let analytics;
  try {
    analytics = await calculateAnalytics(req.user?._id, businessId);
  } catch (err) {
    return fail(res, err.message || 'Unable to compute analytics', err.statusCode || 500);
  }

  analytics = analytics || {};
  const inventoryVsReorder = Array.isArray(analytics.inventoryVsReorder)
    ? analytics.inventoryVsReorder
    : [];
  const hasData =
    (analytics.counts?.sales || 0) > 0 ||
    (analytics.counts?.expenses || 0) > 0 ||
    (analytics.counts?.inventory || 0) > 0 ||
    (analytics.counts?.products || 0) > 0;

  if (!hasData) {
    return ok(res, 'No business data available yet.', {
      hasData: false,
      kpis: null,
      charts: null,
      profitAnalysis: null,
      dataQuality: analytics.dataQuality || null,
      insights: analytics.insights || {},
      inventoryVsReorder: [],
      lowStockItems: [],
      counts: analytics.counts || {
        sales: 0,
        expenses: 0,
        products: 0,
        inventory: 0,
        uploads: 0,
      },
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
      lowStockItems: Array.isArray(analytics.lowStockItems) ? analytics.lowStockItems.length : 0,
    },
    charts: {
      salesByCategory: analytics.salesByCategory,
      expenseAllocation: analytics.expenseAllocation,
      topProducts: analytics.topProducts,
      revenueTrend: analytics.revenueTrend,
      revenueTrendGranularity: analytics.revenueTrendGranularity,
      trendStats: analytics.trendStats,
    },
    inventoryVsReorder,
    lowStockItems: analytics.lowStockItems || [],
    profitAnalysis: analytics.profitAnalysis,
    dataQuality: analytics.dataQuality,
    insights: analytics.insights,
    counts: analytics.counts,
  });
});

export const getDeepAnalytics = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  let analytics;
  try {
    analytics = await calculateAnalytics(req.user?._id, businessId);
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
    analytics = await calculateAnalytics(req.user?._id, businessId);
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
  const userId = req.user?._id;
  if (!userId) return fail(res, 'No authenticated user.', 401);
  const filter = buildDateFilter(req.query);
  const sales = await Sale.find({ businessId, userId, ...filter }).lean();
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
  const userId = req.user?._id;
  if (!userId) return fail(res, 'No authenticated user.', 401);
  const filter = buildDateFilter(req.query);
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const sales = await Sale.find({ businessId, userId, ...filter }).sort({ date: -1 }).limit(limit).lean();
  return ok(res, 'Sales retrieved.', { count: sales.length, sales });
});

export const getProducts = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;
  const userId = req.user?._id;
  if (!userId) return fail(res, 'No authenticated user.', 401);
  const products = await Product.find({ businessId, userId }).lean();
  return ok(res, 'Products retrieved.', { count: products.length, products });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;
  const userId = req.user?._id;
  if (!userId) return fail(res, 'No authenticated user.', 401);
  const filter = buildDateFilter(req.query);
  const expenses = await Expense.find({ businessId, userId, ...filter }).lean();
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
  const userId = req.user?._id;
  if (!userId) return fail(res, 'No authenticated user.', 401);
  const inventory = await Inventory.find({ businessId, userId }).lean();
  return ok(res, 'Inventory retrieved.', { count: inventory.length, inventory });
});

export const getTrends = asyncHandler(async (req, res) => {
  const businessId = requireBusiness(req, res);
  if (!businessId) return;

  let analytics;
  try {
    analytics = await calculateAnalytics(req.user?._id, businessId);
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
