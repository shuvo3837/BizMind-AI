import React, { useEffect, useState } from 'react';
import { FiX, FiCheckCircle, FiFile, FiTrash2 } from 'react-icons/fi';
import FileTypeIcon from './FileTypeIcon.jsx';

export const FilePreview = ({ file, onRemove, uploading = false }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setImagePreviewUrl(null);
      return;
    }

    if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [file]);

  if (!file) return null;

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getExtensionLabel = (filename) => {
    if (!filename) return 'File';
    return filename.split('.').pop().toUpperCase();
  };

  return (
    <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {imagePreviewUrl ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
              <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <FileTypeIcon fileName={file.name} fileType={file.type} size={22} className="w-12 h-12" />
          )}

          <div className="min-w-0">
            <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md" title={file.name}>
              {file.name}
            </h5>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {formatSize(file.size)}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">
                {getExtensionLabel(file.name)}
              </span>
            </div>
          </div>
        </div>

        {!uploading && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
            title="Remove selected file"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
