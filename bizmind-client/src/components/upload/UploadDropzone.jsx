import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiFile, FiCheck, FiInfo, FiAlertCircle } from 'react-icons/fi';

export const UploadDropzone = ({ onFileSelected, disabled = false, maxSizeBytes = 25 * 1024 * 1024 }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.csv', '.xlsx', '.xls', '.pdf', '.jpg', '.jpeg', '.png', '.webp'];

  const validateAndPassFile = (file) => {
    setErrorMessage('');
    if (!file) return;

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMessage(`Unsupported format (${fileExt}). Please upload CSV, Excel (.xlsx, .xls), PDF, or Images (.jpg, .png, .webp).`);
      return;
    }

    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File size (${sizeMB}MB) exceeds maximum allowed limit of 25MB.`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-200 select-none ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-4 ring-indigo-500/10'
            : disabled
            ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-900/40 dark:hover:bg-slate-800/50 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-2xl transition-transform duration-300 shadow-lg ${
            isDragOver 
              ? 'bg-indigo-600 text-white scale-110 shadow-indigo-500/30' 
              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-indigo-500/5'
          }`}>
            <FiUploadCloud size={38} className={isDragOver ? 'animate-bounce' : ''} />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {isDragOver ? 'Drop file here to upload' : 'Drag & drop business file here'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              or <span className="font-semibold text-indigo-600 dark:text-indigo-400 underline underline-offset-2">Browse Files</span> from your device
            </p>
          </div>

          {/* Badges & File Specs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <FiFile className="text-slate-400" size={12} /> CSV
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Excel (.xlsx, .xls)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              PDF
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Image (.jpg, .png, .webp)
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-1">
            <FiInfo size={13} />
            <span>Maximum file size: <strong>25 MB</strong> per upload</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium animate-shake">
          <FiAlertCircle size={16} className="shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;
