import React, { useState } from 'react';
import { UploadCloud, File, FileSpreadsheet, FileText, Image, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const FileDropzone = ({ onFileSelect, uploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
        <UploadCloud size={28} />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Upload Business File for AI Analysis
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
        Drag & drop your CSV sales data, Excel financial sheets, PDF audits, or receipt images.
      </p>

      <div className="flex justify-center items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-6">
        <span className="flex items-center gap-1"><FileSpreadsheet size={14} /> CSV / Excel</span>
        <span className="flex items-center gap-1"><FileText size={14} /> PDF Reports</span>
        <span className="flex items-center gap-1"><Image size={14} /> Receipts / PNG</span>
      </div>

      <label className="inline-block">
        <input
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg,.json"
          onChange={handleChange}
          disabled={uploading}
        />
        <span className="cursor-pointer inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs">
          Browse Files
        </span>
      </label>

      {selectedFile && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 size={14} /> Selected: {selectedFile.name}
        </div>
      )}
    </div>
  );
};
