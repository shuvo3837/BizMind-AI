import { calculateAnalytics } from '../services/analyticsService.js';
import { generateAiResponse, isAiConfigured, getActiveAiProvider } from '../services/aiService.js';
import Upload from '../models/Upload.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

export const queryAIChat = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const prompt = (req.body.prompt || req.body.message || req.body.question || '').trim();
  if (!prompt) return fail(res, 'A prompt is required.', 400);

  if (!isAiConfigured()) {
    return fail(res, 'No AI provider is configured on the server.', 503);
  }

  const analytics = await calculateAnalytics(req.user?._id, businessId);
  const ai = await generateAiResponse(
    {
      metrics: {
        totalRevenue: analytics.totalRevenue,
        totalProfit: analytics.totalProfit,
        totalExpenses: analytics.totalExpenses,
        profitMargin: analytics.profitMargin,
      },
      topProducts: analytics.topProducts?.slice(0, 10) || [],
      revenueByCategory: analytics.revenueByCategory || [],
    },
    prompt
  );

  if (!ai.ok) return fail(res, ai.error || 'AI provider failed.', 503);
  return ok(res, 'AI response generated.', { provider: ai.provider, text: ai.text });
});

export const analyzeDatasetAI = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const datasetId = req.params.datasetId;
  if (!datasetId) return fail(res, 'Dataset ID is required.', 400);

  const upload = await Upload.findOne({ _id: datasetId, businessId, userId: req.user?._id }).lean();
  if (!upload) return fail(res, 'Dataset not found or access denied.', 404);

  const [sales, expenses, products, inventory] = await Promise.all([
    Sale.find({ businessId, userId: req.user?._id, uploadId: datasetId }).lean(),
    Expense.find({ businessId, userId: req.user?._id, uploadId: datasetId }).lean(),
    Product.find({ businessId, userId: req.user?._id, uploadId: datasetId }).lean(),
    Inventory.find({ businessId, userId: req.user?._id, uploadId: datasetId }).lean(),
  ]);

  const totalRevenue = sales.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0;

  const analytics = {
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit: totalProfit,
    profitMargin,
    orders: sales.length,
    quantity: sales.reduce((sum, item) => sum + (item.quantity || 0), 0),
    topProducts: products.slice(0, 5),
    inventoryStatus: inventory.slice(0, 5),
  };

  const ai = await generateAiResponse(analytics, 'Based ONLY on the verified data above, produce concise business insights with a short executive summary, key insights, recommendations, and risks.');
  if (!ai.ok) return fail(res, ai.error || 'AI provider failed.', 503);

  return ok(res, 'Dataset AI analysis generated.', {
    success: true,
    dataset: { id: upload._id, fileName: upload.originalName },
    summary: ai.text,
  });
});

export const getAIRecommendations = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const analytics = await calculateAnalytics(req.user?._id, businessId);
  const hasData =
    (analytics.totalSales || 0) + (analytics.totalProducts || 0) + (analytics.totalExpenses || 0) > 0 ||
    (Array.isArray(analytics.inventoryStatus) ? analytics.inventoryStatus.length : (analytics.inventoryCount || 0)) > 0;

  if (!hasData) {
    return ok(res, 'No data available for recommendations.', {
      recommendations: [],
      hasData: false,
    });
  }

  if (!isAiConfigured()) {
    const recommendations = buildRuleBasedRecommendations(analytics);
    return ok(res, 'Rule-based recommendations generated (no AI provider configured).', {
      provider: 'rules',
      recommendations,
      hasData: true,
    });
  }

  const ai = await generateAiResponse(
    {
      metrics: {
        totalRevenue: analytics.totalRevenue,
        totalProfit: analytics.totalProfit,
        totalExpenses: analytics.totalExpenses,
        profitMargin: analytics.profitMargin,
      },
      topProducts: analytics.topProducts || [],
      revenueByCategory: analytics.revenueByCategory || [],
      expenseByCategory: analytics.expenseByCategory || [],
      inventoryStatus: analytics.inventoryStatus || [],
    },
    'Based ONLY on the verified data above, list 5 concrete, data-backed business recommendations.'
  );

  if (!ai.ok) {
    return ok(res, 'AI provider failed; rule-based recommendations returned.', {
      provider: 'rules',
      recommendations: buildRuleBasedRecommendations(analytics),
      hasData: true,
      aiError: ai.error,
    });
  }

  return ok(res, 'AI recommendations generated.', {
    provider: ai.provider,
    text: ai.text,
    hasData: true,
  });
});

export const getAIStatus = asyncHandler(async (req, res) => {
  return ok(res, 'AI provider status.', {
    configured: isAiConfigured(),
    activeProvider: getActiveAiProvider(),
    providers: {
      gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10),
      groq: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10),
    },
  });
});

const buildRuleBasedRecommendations = (analytics) => {
  const recs = [];

  if (analytics.profitMargin < 10 && analytics.totalRevenue > 0) {
    recs.push({
      priority: 'high',
      category: 'profitability',
      title: 'Improve profit margin',
      detail: `Your current profit margin is ${analytics.profitMargin}%, which is below the 10% healthy threshold. Review pricing, reduce low-margin products, and cut discretionary expenses.`,
    });
  }

  const lowStock = (analytics.inventoryStatus || []).filter((i) => i.lowStock);
  if (lowStock.length > 0) {
    recs.push({
      priority: 'high',
      category: 'inventory',
      title: `${lowStock.length} items need restocking`,
      detail: `Products at or below reorder level: ${lowStock.slice(0, 5).map((i) => i.productName).join(', ')}.`,
    });
  }

  if (analytics.topProducts && analytics.topProducts.length > 0) {
    const top = analytics.topProducts[0];
    recs.push({
      priority: 'medium',
      category: 'sales',
      title: `Top product: ${top.productName}`,
      detail: `${top.productName} drives ${Math.round(top.revenue / (analytics.totalRevenue || 1) * 100)}% of revenue. Consider expanding marketing around it and sourcing alternatives to reduce dependency risk.`,
    });
  }

  if (analytics.totalExpenses > analytics.totalProfit && analytics.totalProfit > 0) {
    recs.push({
      priority: 'high',
      category: 'expenses',
      title: 'Expenses exceed profit',
      detail: `Total expenses (${analytics.totalExpenses}) exceed profit (${analytics.totalProfit}). Audit the largest expense categories and renegotiate recurring costs.`,
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 'low',
      category: 'general',
      title: 'Keep monitoring',
      detail: 'Your metrics look stable. Continue tracking revenue, profit, and inventory weekly to spot changes early.',
    });
  }

  return recs;
};
