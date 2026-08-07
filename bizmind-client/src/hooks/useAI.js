import { useState } from 'react';
import { aiService } from '../services/aiService.js';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (prompt, businessContext) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.sendChatMessage(prompt, businessContext);
      return res.data;
    } catch (err) {
      setError(err.message || 'AI request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
};
