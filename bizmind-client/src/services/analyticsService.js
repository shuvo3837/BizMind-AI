import api from './api.js';

export const analyticsService = {
  getSummary: async (period = 'all') => {
    const res = await api.get(`/analytics/summary?period=${period}`);
    return res.data;
  },
  getRevenueTrend: async (period = 'all') => {
    const res = await api.get(`/analytics/revenue-trend?period=${period}`);
    return res.data;
  },
  getCategoryPerformance: async (period = 'all') => {
    const res = await api.get(`/analytics/category-performance?period=${period}`);
    return res.data;
  },
  getTopProducts: async (period = 'all', limit = 5) => {
    const res = await api.get(`/analytics/top-products?period=${period}&limit=${limit}`);
    return res.data;
  },
  getInventory: async () => {
    const res = await api.get('/analytics/inventory');
    return res.data;
  },
  getInsights: async (period = 'all') => {
    const res = await api.get(`/analytics/insights?period=${period}`);
    return res.data;
  },
  getDashboardData: async (period = 'all') => {
    const res = await api.get(`/analytics/dashboard?period=${period}`);
    return res.data;
  },
  getDeepAnalytics: async (period = 'all') => {
    const res = await api.get(`/analytics/deep?period=${period}`);
    return res.data;
  }
};

export default analyticsService;
