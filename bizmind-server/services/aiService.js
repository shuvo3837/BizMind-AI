import { isGeminiConfigured, generateBusinessInsights } from './geminiService.js';
import { isGroqConfigured, generateWithGroq } from './groqService.js';

const EMPTY_RESPONSE = {
  ok: false,
  provider: 'none',
  error: 'No AI provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY in your .env file.',
};

export const isAiConfigured = () => isGeminiConfigured() || isGroqConfigured();

export const getActiveAiProvider = () => {
  if (isGeminiConfigured()) return 'gemini';
  if (isGroqConfigured()) return 'groq';
  return null;
};

const formatForGroq = (businessData, userPrompt) => {
  const userMessage = `Business Data & Calculated Analytics (verified from the user's database). This may be empty if the user has not uploaded data yet.

${JSON.stringify(businessData, null, 2)}

User Question: ${userPrompt || 'Provide an executive summary, top 3 actionable insights, and key risks. If data is empty, give general business advice instead.'}`;

  return {
    messages: [
      { role: 'user', content: userMessage },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    max_tokens: 1024,
  };
};

export const generateAiResponse = async (businessData, userPrompt = '') => {
  if (!isAiConfigured()) {
    return EMPTY_RESPONSE;
  }

  if (isGeminiConfigured()) {
    const result = await generateBusinessInsights(businessData, userPrompt);
    if (result.ok) return result;

    if (isGroqConfigured()) {
      const groq = await generateWithGroq(formatForGroq(businessData, userPrompt));
      if (groq.ok) return groq;
      return {
        ok: false,
        provider: 'all',
        error: `Gemini failed (${result.error}); Groq failed (${groq.error}).`,
      };
    }
    return result;
  }

  const groq = await generateWithGroq(formatForGroq(businessData, userPrompt));
  if (groq.ok) return groq;
  return {
    ok: false,
    provider: 'groq',
    error: groq.error,
  };
};

export const summarizeForUi = (aiResponse) => ({
  ok: aiResponse.ok,
  provider: aiResponse.provider,
  text: aiResponse.text,
  error: aiResponse.error,
});
