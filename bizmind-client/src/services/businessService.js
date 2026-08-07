import api from './api.js';

export const businessService = {
  getProfile: async () => {
    const res = await api.get('/business/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/business/profile', data);
    return res.data;
  }
};
