import api from './api.js';

export const analyticsService = {
  getDashboardData: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },
  getDeepAnalytics: async () => {
    const res = await api.get('/analytics/deep');
    return res.data;
  }
};
