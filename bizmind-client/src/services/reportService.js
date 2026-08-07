import api from './api.js';

export const reportService = {
  generateReport: async (reportConfig) => {
    const res = await api.post('/report/generate', reportConfig);
    return res.data;
  },
  getReports: async () => {
    const res = await api.get('/report/list');
    return res.data;
  }
};
