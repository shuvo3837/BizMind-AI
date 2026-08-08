import React from 'react';
import { 
  FiFileText, 
  FiGrid, 
  FiImage, 
  FiFile, 
  FiTable 
} from 'react-icons/fi';

export const FileTypeIcon = ({ fileType = '', fileName = '', size = 20, className = '' }) => {
  const typeStr = (fileType || '').toLowerCase();
  const nameStr = (fileName || '').toLowerCase();

  if (typeStr.includes('csv') || nameStr.endsWith('.csv')) {
    return (
      <div className={`p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center shrink-0 ${className}`}>
        <FiTable size={size} />
      </div>
    );
  }

  if (typeStr.includes('excel') || typeStr.includes('xls') || nameStr.endsWith('.xlsx') || nameStr.endsWith('.xls')) {
    return (
      <div className={`p-2 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50 flex items-center justify-center shrink-0 ${className}`}>
        <FiGrid size={size} />
      </div>
    );
  }

  if (typeStr.includes('pdf') || nameStr.endsWith('.pdf')) {
    return (
      <div className={`p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center shrink-0 ${className}`}>
        <FiFileText size={size} />
      </div>
    );
  }

  if (typeStr.includes('image') || typeStr.includes('jpg') || typeStr.includes('png') || typeStr.includes('webp') || nameStr.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return (
      <div className={`p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center shrink-0 ${className}`}>
        <FiImage size={size} />
      </div>
    );
  }

  return (
    <div className={`p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 ${className}`}>
      <FiFile size={size} />
    </div>
  );
};

export default FileTypeIcon;
