import React, { useState } from 'react';
import { FiFileText, FiEye, FiDownload, FiCheck, FiCalendar } from 'react-icons/fi';

export const ReportCard = ({ report, onView, onDownload }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      if (onDownload) onDownload(report);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FiFileText size={20} />
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {report.fileSize || '2.4 MB'}
          </span>
        </div>

        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{report.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{report.description}</p>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-medium">
          <FiCalendar size={12} />
          <span>Generated {report.date || 'Aug 07, 2026'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onView && onView(report)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <FiEye size={13} />
          <span>View</span>
        </button>

        <button
          onClick={handleDownloadClick}
          disabled={downloading}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all ${
            downloaded
              ? 'bg-emerald-600'
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
          }`}
        >
          {downloading ? (
            <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
          ) : downloaded ? (
            <>
              <FiCheck size={13} />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <FiDownload size={13} />
              <span>Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
