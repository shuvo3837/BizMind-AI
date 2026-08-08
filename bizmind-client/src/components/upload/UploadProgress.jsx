import React from 'react';
import { FiLoader, FiCheckCircle, FiAlertCircle, FiCpu } from 'react-icons/fi';

export const UploadProgress = ({ progress = 0, status = 'Uploading', fileName = '' }) => {
  const isComplete = progress >= 100 || status === 'Completed';
  const isFailed = status === 'Failed';

  const getStatusText = () => {
    if (isFailed) return 'Upload Failed';
    if (progress < 100) return `Uploading ${progress}%...`;
    if (status === 'Processing') return 'AI Engine processing data & extracting metrics...';
    return 'Upload & Analysis Completed!';
  };

  return (
    <div className="rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          {!isComplete && !isFailed && (
            <FiLoader size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          )}
          {isComplete && !isFailed && (
            <FiCheckCircle size={16} className="text-emerald-500" />
          )}
          {isFailed && (
            <FiAlertCircle size={16} className="text-rose-500" />
          )}
          <span>{getStatusText()}</span>
        </div>
        <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.min(progress, 100)}%</span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2.5 bg-indigo-100 dark:bg-indigo-900/60 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFailed
              ? 'bg-rose-500'
              : isComplete
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-indigo-500 to-indigo-600 animate-pulse'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {fileName && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          File: <span className="font-medium text-slate-700 dark:text-slate-300">{fileName}</span>
        </p>
      )}
    </div>
  );
};

export default UploadProgress;
