import dotenv from 'dotenv';
dotenv.config();

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const systemPrompt = `You are the BizMind AI Business Intelligence assistant.

RULES:
1. When the user's verified business data is provided, ALWAYS prioritize and reference the actual numbers from it. Be specific and tie every recommendation back to those metrics.
2. If the dataset is empty or no business data is provided, you may still answer general business, strategy, finance, marketing, inventory, and operations questions using widely accepted best practices. In that case, clearly note that the answer is general guidance and not tied to the user's specific data.
3. Never fabricate specific revenue figures, product names, customer counts, or other concrete business facts the user has not provided.`;

export const isGroqConfigured = () => {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key || key.length < 20) return false;
  if (/^(your_|placeholder|changeme|replace|gsk_placeholder)/i.test(key)) return false;
  if (key === 'your_groq_api_key_here') return false;
  return true;
};

export const generateWithGroq = async ({ messages, model = 'llama-3.3-70b-versatile', temperature = 0.4 }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      provider: 'groq',
      error: 'GROQ_API_KEY is not configured on the server.',
    };
  }

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature,
    max_tokens: 1024,
  };

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        provider: 'groq',
        error: `Groq API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { ok: false, provider: 'groq', error: 'Empty response from Groq.' };
    }

    return {
      ok: true,
      provider: 'groq',
      text: reply,
      usage: data.usage || null,
      model: data.model || model,
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'groq',
      error: error.message || 'Unknown Groq error',
    };
  }
};