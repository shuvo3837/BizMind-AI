import { useState } from 'react';
import { uploadService } from '../services/uploadService.js';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const upload = async (file) => {
    setUploading(true);
    setProgress(20);
    setError(null);
    setResult(null);
    try {
      setProgress(40);
      const res = await uploadService.uploadFile(file);
      const payload = res?.data || res;
      setProgress(100);
      setResult(payload);
      return payload;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'File upload failed';
      setError(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error, result };
};
