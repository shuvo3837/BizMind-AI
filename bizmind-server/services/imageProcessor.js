import fs from 'fs';
import path from 'path';
import { extractBusinessDataFromImage, isGeminiConfigured } from './geminiService.js';

const detectMime = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/png';
  }
};

export const parseImageFile = async (filePath, originalName = filePath) => {
  if (!fs.existsSync(filePath)) return [];

  if (!isGeminiConfigured()) {
    return [];
  }

  const result = await extractBusinessDataFromImage(filePath, detectMime(originalName));
  if (!result.ok) {
    console.warn('[imageProcessor] Gemini vision failed:', result.error);
    return [];
  }

  return result.rows || [];
};
