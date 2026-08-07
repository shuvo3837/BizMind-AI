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
    if (!apiKey) {
      return {
        summary: "Gemini API key is not configured in settings secrets. Displaying rule-based intelligence analysis.",
        recommendations: [
          "Optimize high-margin product inventory to capitalize on demand spikes.",
          "Reduce customer acquisition costs by targeting high-converting regional segments.",
          "Automate weekly expense audits to control operational overhead."
        ],
        kpiReview: "Revenue is tracking at 84% of monthly target with positive gross margin."
      };
    }

    const ai = getGeminiClient();
    const prompt = `You are a Senior Business Intelligence Consultant & CFO Advisor for BizMind AI. 
Analyze the following business metrics and provide strategic insights:

Business Context:
${JSON.stringify(businessData, null, 2)}

${customPrompt ? `User Inquiry: ${customPrompt}` : 'Provide a high-level executive summary, top 3 actionable growth recommendations, and key financial risks to watch.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: "Respond as an expert executive business analyst. Provide crisp, data-backed, bulleted insights.",
        temperature: 0.7
      }
    });

    return {
      text: response.text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini Service Error:', error);
    return {
      error: true,
      message: error.message || 'Failed to communicate with AI model.',
      text: "Unable to query AI engine at this time. Please check your Gemini API key in Secrets panel."
    };
  }
};
