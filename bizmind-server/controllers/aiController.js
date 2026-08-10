import { calculateAnalytics } from '../services/analyticsService.js';
import { generateAiResponse, isAiConfigured, getActiveAiProvider } from '../services/aiService.js';
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

  const analytics = await calculateAnalytics(businessId);
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

export const getAIRecommendations = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const analytics = await calculateAnalytics(businessId);
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
