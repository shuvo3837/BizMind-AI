import { generateBusinessInsights } from '../services/geminiService.js';
import analyticsService from '../services/analyticsService.js';
import { getBusinessContext } from '../services/businessContextService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import ChatHistory from '../models/ChatHistory.js';

export const queryAIChat = async (req, res) => {
  try {
    const { prompt, message, period } = req.body;
    const userMessage = prompt || message || 'Provide executive analysis';
    const { businessId, userId } = await getBusinessContext(req);

    const summary = await analyticsService.getAnalyticsSummary(businessId, period || 'all');
    const topProducts = await analyticsService.getTopProducts(businessId, period || 'all', 1);
    const categories = await analyticsService.getCategoryPerformance(businessId, period || 'all');

    const businessContext = {
      ...summary,
      topProduct: topProducts[0] || null,
      topCategory: categories[0] || null
    };

    const aiResponse = await generateBusinessInsights(businessContext, userMessage);
    const replyText = aiResponse.reply || aiResponse.message || 'Analysis generated.';

    // Save Chat History to MongoDB
    try {
      let historyDoc = await ChatHistory.findOne({ businessId, userId });
      if (!historyDoc) {
        historyDoc = new ChatHistory({
          businessId,
          userId,
          sessionTitle: 'BI Strategy Session',
          messages: []
        });
      }
      historyDoc.messages.push({ sender: 'user', text: userMessage, timestamp: new Date() });
      historyDoc.messages.push({ sender: 'ai', text: replyText, timestamp: new Date() });
      await historyDoc.save();
    } catch (dbErr) {
      console.warn('Chat history persistence warning:', dbErr.message);
    }

    return sendSuccess(res, 'AI response generated', {
      reply: replyText,
      hasData: summary.hasData,
      businessId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return sendError(res, error.message || 'Error processing AI chat query', 500);
  }
};

export const getAIRecommendations = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const period = req.query?.period || 'all';

    const insights = await analyticsService.getCalculatedInsights(businessId, period);

    return sendSuccess(res, 'AI recommendations loaded', insights);
  } catch (error) {
    return sendError(res, error.message || 'Error generating AI recommendations', 500);
  }
};

export default {
  queryAIChat,
  getAIRecommendations
};
