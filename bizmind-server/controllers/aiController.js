import { generateBusinessInsights } from '../services/geminiService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const queryAIChat = async (req, res) => {
  try {
    const { prompt, businessContext } = req.body;

    if (!prompt) {
      return sendError(res, 'Prompt is required', 400);
    }

    const aiResponse = await generateBusinessInsights(businessContext || {
      companyName: 'Apex Growth Dynamics',
      revenue: 184500,
      expenses: 62300,
      topCategory: 'SaaS Subscriptions'
    }, prompt);

    return sendSuccess(res, 'AI response generated', {
      reply: aiResponse.text || aiResponse.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAIRecommendations = async (req, res) => {
  const recommendations = [
    {
      id: 'rec_1',
      type: 'revenue_growth',
      title: 'Expand High-Margin Enterprise Subscriptions',
      impact: 'High (+$22,000 / mo)',
      confidence: 94,
      description: 'Your Enterprise Add-ons hold a 78% profit margin. Increasing sales team outreach to current SaaS customers could generate $22K in recurring annual contract value.'
    },
    {
      id: 'rec_2',
      type: 'cost_reduction',
      title: 'Restructure Ad Campaign Bidding for North America',
      impact: 'Medium (-$4,500 / mo)',
      confidence: 88,
      description: 'Acquisition cost in North America spiked 12% last month. Reallocating $5,000 ad budget toward Asia Pacific channels yields 1.8x higher return on ad spend.'
    },
    {
      id: 'rec_3',
      type: 'inventory_alert',
      title: 'Trigger Automated Reorder for IoT Sensor Node',
      impact: 'Critical (Prevents Stockout)',
      confidence: 99,
      description: 'Current stock is 18 units (reorder point 25). At current 4.2 units/day velocity, stockout will occur in 4 days.'
    }
  ];

  return sendSuccess(res, 'AI recommendations loaded', recommendations);
};
