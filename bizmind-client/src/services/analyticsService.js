import api from './api.js';

export const analyticsService = {
  getDashboardData: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },
  getDatasetData: async (datasetId) => {
    const res = await api.get(`/analytics/dataset/${datasetId}`);
    return res.data;
  },
  getDeepAnalytics: async () => {
    const res = await api.get('/analytics/deep');
    return res.data;
  },
  getRevenueData: async () => {
    const res = await api.get('/analytics/revenue');
    return res.data;
  },
  getExpenseData: async () => {
    const res = await api.get('/analytics/expenses');
    return res.data;
  },
  getProductsData: async () => {
    const res = await api.get('/analytics/products');
    return res.data;
  },
  getInventoryData: async () => {
    const res = await api.get('/analytics/inventory');
    return res.data;
  },
  getTrendsData: async () => {
    const res = await api.get('/analytics/trends');
    return res.data;
  }
};
