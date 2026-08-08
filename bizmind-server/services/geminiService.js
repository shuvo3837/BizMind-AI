import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

const getGeminiClient = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
};

export const generateBusinessInsights = async (businessData, customPrompt = '') => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!businessData || !businessData.hasData) {
      return {
        reply: "No business data has been uploaded yet. Please upload your CSV, Excel, or PDF files in the Upload Center to receive AI strategic analysis.",
        hasData: false
      };
    }

    if (!apiKey) {
      // Rule-based structured fallback using verified metrics only
      const rev = businessData.totalRevenue?.toLocaleString() || 0;
      const profit = businessData.totalProfit?.toLocaleString() || 0;
      const margin = businessData.profitMargin || 0;

      return {
        reply: `Based on your verified uploaded data: Total Revenue is $${rev}, Net Profit is $${profit}, and Profit Margin is ${margin}%. To unlock deeper conversational AI analysis, please add your GEMINI_API_KEY in the Settings secret panel.`,
        hasData: true
      };
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are BizMind AI, an elite Business Analyst & CFO Advisor.
CRITICAL MANDATE:
- You must ONLY talk about the provided verified business metrics.
- NEVER invent, assume, or synthesize fake financial numbers, fake revenue, fake clients, or fake percentage trends that are not in the provided dataset.
- If the data is limited, state clearly that analysis is based on available uploaded transaction records.`;

    const promptText = `
Verified Business Metrics:
- Total Gross Revenue: $${businessData.totalRevenue}
- Total Cost / Expenses: $${businessData.totalCost}
- Net Operating Profit: $${businessData.totalProfit}
- Profit Margin: ${businessData.profitMargin}%
- Total Sales Transactions: ${businessData.totalSales}
- Unique Products: ${businessData.totalProducts}
- Average Order Value: $${businessData.averageOrderValue}
- Growth Rate: ${businessData.growthRate}% (${businessData.growthStatus})
- Top Revenue Item: ${businessData.topProduct ? `${businessData.topProduct.productName} ($${businessData.topProduct.totalRevenue})` : 'N/A'}
- Top Category: ${businessData.topCategory ? `${businessData.topCategory.category} ($${businessData.topCategory.revenue})` : 'N/A'}

User Inquiry: ${customPrompt || 'Provide an executive summary, profit analysis, and actionable steps.'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3
      }
    });

    return {
      reply: response.text || 'Analysis complete.',
      hasData: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini Service Error:', error);
    return {
      error: true,
      reply: `Error communicating with AI model: ${error.message}. Please check your API key.`
    };
  }
};

export default {
  generateBusinessInsights
};
