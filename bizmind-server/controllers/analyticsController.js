import analyticsService from '../services/analyticsService.js';
import { getBusinessContext } from '../services/businessContextService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSummary = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query.period || 'all';

    const data = await analyticsService.getAnalyticsSummary(businessId, period);
    console.log('[ANALYTICS]', {
      businessId,
      salesRecords: data.totalSales,
      revenue: data.totalRevenue
    });
    return sendSuccess(res, 'Analytics summary retrieved', data);
  } catch (error) {
    return sendError(res, error.message || 'Error calculating analytics summary', 500);
  }
};

export const getRevenueTrend = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query.period || 'all';

    const trend = await analyticsService.getRevenueTrend(businessId, period);
    return sendSuccess(res, 'Revenue trend retrieved', trend);
  } catch (error) {
    return sendError(res, error.message || 'Error fetching revenue trend', 500);
  }
};

export const getCategoryPerformance = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query.period || 'all';

    const categories = await analyticsService.getCategoryPerformance(businessId, period);
    return sendSuccess(res, 'Category performance retrieved', categories);
  } catch (error) {
    return sendError(res, error.message || 'Error fetching category performance', 500);
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query.period || 'all';
    const limit = parseInt(req.query.limit, 10) || 5;

    const products = await analyticsService.getTopProducts(businessId, period, limit);
    return sendSuccess(res, 'Top products retrieved', products);
  } catch (error) {
    return sendError(res, error.message || 'Error fetching top products', 500);
  }
};

export const getInventoryAnalytics = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);

    const inventory = await analyticsService.getInventoryAnalytics(businessId);
    return sendSuccess(res, 'Inventory analytics retrieved', inventory);
  } catch (error) {
    return sendError(res, error.message || 'Error fetching inventory analytics', 500);
  }
};

export const getBusinessInsights = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query.period || 'all';

    const insights = await analyticsService.getCalculatedInsights(businessId, period);
    return sendSuccess(res, 'Business insights calculated', insights);
  } catch (error) {
    return sendError(res, error.message || 'Error generating insights', 500);
  }
};

export const getDashboardAnalytics = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query.period || 'all';

    const overview = await analyticsService.getAnalyticsSummary(businessId, period);
    const revenueTrend = await analyticsService.getRevenueTrend(businessId, period);
    const salesByCategory = await analyticsService.getCategoryPerformance(businessId, period);
    const inventoryHealth = await analyticsService.getInventoryAnalytics(businessId);
    const insights = await analyticsService.getCalculatedInsights(businessId, period);

    return sendSuccess(res, 'Dashboard analytics data loaded', {
      overview,
      revenueTrend,
      salesByCategory,
      inventoryHealth,
      insights
    });
  } catch (error) {
    return sendError(res, error.message || 'Error compiling dashboard analytics', 500);
  }
};

export const getDeepAnalytics = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query.period || 'all';

    const summary = await analyticsService.getAnalyticsSummary(businessId, period);
    const categories = await analyticsService.getCategoryPerformance(businessId, period);
    const topProducts = await analyticsService.getTopProducts(businessId, period, 5);

    return sendSuccess(res, 'Deep analytics insights loaded', {
      summary,
      topPerformingCategories: categories,
      topProducts,
      averageBasketSize: summary.averageOrderValue
    });
  } catch (error) {
    return sendError(res, error.message || 'Error compiling deep analytics', 500);
  }
};

export default {
  getSummary,
  getRevenueTrend,
  getCategoryPerformance,
  getTopProducts,
  getInventoryAnalytics,
  getBusinessInsights,
  getDashboardAnalytics,
  getDeepAnalytics
};
