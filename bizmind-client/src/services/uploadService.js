import api from './api.js';

export const uploadService = {
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return res.data;
  },
  previewFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/upload');
    return res.data;
  },
  getUploadById: async (id) => {
    const res = await api.get(`/upload/${id}`);
    return res.data;
  },
  deleteUpload: async (id) => {
    const res = await api.delete(`/upload/${id}`);
    return res.data;
  }
};
