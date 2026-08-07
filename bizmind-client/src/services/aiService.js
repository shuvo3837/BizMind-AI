import api from './api.js';

export const aiService = {
  sendChatMessage: async (prompt, businessContext) => {
    const res = await api.post('/ai/chat', { prompt, businessContext });
    return res.data;
  },
  getRecommendations: async () => {
    const res = await api.get('/ai/recommendations');
    return res.data;
  }
};
