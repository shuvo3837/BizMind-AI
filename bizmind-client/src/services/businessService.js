import api from './api.js';

export const businessService = {
  getProfile: async () => {
    const res = await api.get('/business/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/business/profile', data);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/business', data);
    return res.data;
  },
  getAll: async () => {
    const res = await api.get('/business');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/business/${id}`);
    return res.data;
  }
};
