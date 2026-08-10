import ChatHistory from '../models/ChatHistory.js';
import { calculateAnalytics } from '../services/analyticsService.js';
import { generateAiResponse, isAiConfigured } from '../services/aiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

export const postChatMessage = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const message = (req.body.message || req.body.prompt || req.body.text || '').trim();
  if (!message) return fail(res, 'A message is required.', 400);

  if (!isAiConfigured()) {
    return fail(res, 'No AI provider is configured on the server. Set GEMINI_API_KEY or GROQ_API_KEY.', 503);
  }

  const analytics = await calculateAnalytics(businessId);
  const hasData =
    (analytics.totalSales || 0) + (analytics.totalProducts || 0) + (analytics.totalExpenses || 0) > 0 ||
    (Array.isArray(analytics.inventoryStatus) ? analytics.inventoryStatus.length : (analytics.inventoryCount || 0)) > 0;

  const businessContext = {
    businessId,
    metrics: {
      totalRevenue: analytics.totalRevenue,
      totalProfit: analytics.totalProfit,
      totalExpenses: analytics.totalExpenses,
      totalSales: analytics.totalSales,
      profitMargin: analytics.profitMargin,
    },
    topProducts: analytics.topProducts?.slice(0, 10) || [],
    revenueByCategory: analytics.revenueByCategory || [],
    expenseByCategory: analytics.expenseByCategory || [],
    revenueTrend: analytics.revenueTrend || [],
  };

  const ai = await generateAiResponse(businessContext, message);

  let session = await ChatHistory.findOne({
    businessId,
    userId: req.user._id,
    sessionId: req.body.sessionId || 'default',
  });

  if (!session) {
    session = await ChatHistory.create({
      businessId,
      userId: req.user._id,
      sessionId: req.body.sessionId || 'default',
      messages: [],
    });
  }

  session.messages.push({ role: 'user', content: message });
  session.messages.push({
    role: 'assistant',
    content: ai.ok ? ai.text : `AI service error: ${ai.error}`,
    provider: ai.provider,
  });

  if (session.messages.length > 100) {
    session.messages = session.messages.slice(-100);
  }
  await session.save();

  if (!ai.ok) {
    return fail(res, ai.error || 'AI provider failed.', 503);
  }

  return ok(res, 'Message processed.', {
    sessionId: session.sessionId,
    reply: ai.text,
    provider: ai.provider,
    hasData,
  });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const sessionId = req.query.sessionId || 'default';
  const session = await ChatHistory.findOne({
    businessId,
    userId: req.user._id,
    sessionId,
  }).lean();

  return ok(res, 'Chat history retrieved.', {
    sessionId,
    messages: session?.messages || [],
  });
});

export const clearChatHistory = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const sessionId = req.query.sessionId || req.body?.sessionId || 'default';
  await ChatHistory.deleteMany({ businessId, userId: req.user._id, sessionId });
  return ok(res, 'Chat history cleared.', { sessionId });
});
