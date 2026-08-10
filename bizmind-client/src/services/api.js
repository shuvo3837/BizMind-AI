import axios from 'axios';
import { getAuthToken } from '../utils/storage.js';

// NOTE: No default Content-Type here. If we hard-set application/json the
// browser will not be able to add the multipart/form-data boundary required
// for file uploads. We pick the header per-request inside the interceptor.
const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only force application/json for non-FormData bodies. For FormData the
    // browser will set the correct multipart/form-data + boundary header.
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else if (config.data instanceof FormData) {
      // Make sure any inherited Content-Type is removed so axios/browser
      // can set multipart/form-data with a fresh boundary.
      if (config.headers && 'Content-Type' in config.headers) {
        delete config.headers['Content-Type'];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
