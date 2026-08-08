import api from './api.js';

export const uploadService = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    return res.data;
  },

  getUploads: async () => {
    const res = await api.get('/upload');
    return res.data;
  },

  getUploadById: async (id) => {
    const res = await api.get(`/upload/${id}`);
    return res.data;
  },

  deleteUpload: async (id) => {
    const res = await api.get ? await api.delete(`/upload/${id}`) : null;
    return res.data;
  }
};

export default uploadService;
