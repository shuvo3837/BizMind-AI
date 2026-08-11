import { GoogleGenAI } from '@google/genai';

const MODEL_CHAIN = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];

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

RULES:
1. When the user's verified business data is provided, ALWAYS prioritize and reference the actual numbers from it. Be specific and tie every recommendation back to those metrics.
2. If the dataset is empty or no business data is provided, you may still answer general business, strategy, finance, marketing, inventory, and operations questions using widely accepted best practices. In that case, clearly note that the answer is general guidance and not tied to the user's specific data.
3. Never fabricate specific revenue figures, product names, customer counts, or other concrete business facts the user has not provided.`;

const buildPrompt = (context, userPrompt) => {
  const contextBlock = JSON.stringify(context, null, 2);
  return `Business Data & Calculated Analytics (verified from the user's database). This may be empty if the user has not uploaded data yet.

${contextBlock}

User Question: ${userPrompt || 'Provide an executive summary, top 3 actionable insights, and key risks. If data is empty, give general business advice instead.'}`;
};

// The @google/genai SDK sometimes throws plain objects (not Error instances)
// with a JSON-stringified `message` field. Normalize so the controller always
// receives a clean error string.
const extractErrorMessage = (err) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  if (err.error?.message) return err.error.message;
  if (err.status) return `Gemini API returned status ${err.status}`;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Failed to communicate with Gemini.';
  }
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

    let response;
    let lastError;
    for (const modelName of MODEL_CHAIN) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [{ text: prompt }],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.5,
            maxOutputTokens: 1024,
          },
        });
        break;
      } catch (modelErr) {
        lastError = modelErr;
        const msg = extractErrorMessage(modelErr);
        // Try the next model only if this one is unavailable (404) or quota (429).
        if (!/404|429|unavailable|not.found|quota|exhausted/i.test(msg)) {
          throw modelErr;
        }
      }
    }
    if (!response) throw lastError || new Error('All Gemini models failed.');

    const text =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (Array.isArray(response?.candidates?.[0]?.content?.parts)
        ? response.candidates[0].content.parts.map((p) => p?.text || '').join('').trim()
        : '');

    if (!text) {
      return {
        ok: false,
        provider: 'gemini',
        error: `Empty response from Gemini. finishReason=${response?.candidates?.[0]?.finishReason || 'unknown'}`,
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
      error: extractErrorMessage(error),
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
      model: ACTIVE_MODEL,
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
    } catch {
      parsed = [];
    }

    return { ok: true, rows: parsed };
  } catch (error) {
    return { ok: false, error: extractErrorMessage(error) };
  }
};
