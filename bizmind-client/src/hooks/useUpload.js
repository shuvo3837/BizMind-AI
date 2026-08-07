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
    try {
      setTimeout(() => setProgress(60), 300);
      const res = await uploadService.uploadFile(file);
      setProgress(100);
      setResult(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || 'File upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error, result };
};
