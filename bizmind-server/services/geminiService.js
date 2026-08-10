import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

const getGeminiClient = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const isGeminiConfigured = () => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key || key.length < 20) return false;
  if (/^(your_|placeholder|changeme|replace)/i.test(key)) return false;
  if (key === 'your_gemini_api_key_here') return false;
  return true;
};

const SYSTEM_INSTRUCTION = `You are the BizMind AI Business Intelligence advisor.

CRITICAL RULES:
1. Use ONLY the provided business data and calculated analytics. Never invent revenue, products, customers, inventory, expenses, sales, market statistics, or any other business information.
2. If the required information is unavailable or the dataset is empty, you MUST clearly state: "There is insufficient data to answer this question. Please upload your business data first."
3. Be specific, actionable, and reference actual numbers from the provided context.
4. When suggesting strategies, tie each recommendation back to the provided metrics.`;

const buildPrompt = (context, userPrompt) => {
  const contextBlock = JSON.stringify(context, null, 2);
  return `Business Data & Calculated Analytics (verified from the user's database):
${contextBlock}

User Question: ${userPrompt || 'Provide an executive summary, top 3 actionable insights, and key risks based ONLY on the data above.'}

Respond strictly using the verified data above. Do not invent any values.`;
};

export const generateBusinessInsights = async (businessData, userPrompt = '') => {
  if (!isGeminiConfigured()) {
    return {
      ok: false,
      provider: 'gemini',
      error: 'GEMINI_API_KEY is not configured on the server.',
    };
  }

  try {
    const ai = getGeminiClient();
    const prompt = buildPrompt(businessData, userPrompt);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return {
        ok: false,
        provider: 'gemini',
        error: 'Empty response from Gemini.',
      };
    }

    return {
      ok: true,
      provider: 'gemini',
      text,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'gemini',
      error: error.message || 'Failed to communicate with Gemini.',
    };
  }
};

export const extractBusinessDataFromImage = async (imagePath, mimeType) => {
  if (!isGeminiConfigured()) {
    return { ok: false, error: 'GEMINI_API_KEY is not configured on the server.' };
  }

  try {
    const fs = await import('fs');
    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString('base64');

    const ai = getGeminiClient();
    const prompt = `You are a business document OCR specialist. Analyze this image (which may contain an invoice, receipt, sales record, inventory sheet, or similar business document) and extract structured business data as JSON.

Return ONLY a JSON array of records. Each record should contain whichever of these fields are visible:
- date (YYYY-MM-DD if possible)
- productName (or product)
- sku
- category
- quantity
- unitPrice
- revenue (or total)
- cost
- amount (for expenses)
- customer
- description

If the document does not contain extractable business data, return an empty array []. Do NOT fabricate any data.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { text: prompt },
        { inlineData: { mimeType: mimeType || 'image/png', data: base64 } },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text || '';
    let parsed = [];
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) parsed = [];
    } catch (err) {
      parsed = [];
    }

    return { ok: true, rows: parsed };
  } catch (error) {
    return { ok: false, error: error.message || 'Gemini vision failed' };
  }
};
