import React, { useState } from 'react';
import { 
  FiTrash2, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLoader, 
  FiSearch, 
  FiFileText,
  FiRefreshCw,
  FiLayers
} from 'react-icons/fi';
import FileTypeIcon from './FileTypeIcon.jsx';

export const UploadHistory = ({ uploads = [], onDelete, onRefresh, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (statusStr) => {
    const status = (statusStr || 'Completed').toLowerCase();

    if (status === 'uploading' || status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <FiLoader className="animate-spin text-indigo-500" size={12} />
          <span>Processing</span>
        </span>
      );
    }

    if (status === 'completed' || status === 'uploaded' || status === 'processed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <FiCheckCircle className="text-emerald-500" size={12} />
          <span>Processed</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <FiAlertCircle className="text-rose-500" size={12} />
        <span>Failed</span>
      </span>
    );
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this file and its parsed sales data? Analytics will automatically recalculate.')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredUploads = uploads.filter(item => {
    const name = item.originalName || item.fileName || item.filename || '';
    const type = item.fileType || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Uploaded Business Datasets</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 text-xs font-bold">
              {uploads.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingested datasets automatically feeding into the unified analytics pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search uploaded files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh upload list"
            >
              <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="py-3 px-4">File Name</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Records</th>
              <th className="py-3 px-4">Detected Data Types</th>
              <th className="py-3 px-3">Upload Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            {filteredUploads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FiFileText size={36} className="text-slate-300 dark:text-slate-700" />
                    <p className="font-semibold text-sm">No uploaded business files</p>
                    <p className="text-xs text-slate-400 max-w-xs">Upload your sales ledger, CSV, Excel or PDF financial reports above to populate analytics.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUploads.map((item) => {
                const itemId = item._id || item.id;
                const name = item.originalName || item.fileName || item.filename || 'File';
                const date = item.uploadedAt || item.createdAt;
                const type = item.fileType || 'Document';
                const records = item.recordsCount || item.extractedData?.recordsExtracted || 0;
                const detected = item.detectedDataTypes || item.extractedData?.detectedDataTypes || ['Business Data'];

                return (
                  <tr key={itemId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* File Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <FileTypeIcon fileName={name} fileType={type} size={16} className="w-7 h-7" />
                        <span className="truncate max-w-xs" title={name}>
                          {name}
                        </span>
                      </div>
                    </td>

                    {/* File Type */}
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                        {type}
                      </span>
                    </td>

                    {/* Records Count */}
                    <td className="py-3.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {records > 0 ? `${records} rows` : '1 document'}
                    </td>

                    {/* Detected Data Types */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {detected.map((dt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                          >
                            <FiLayers size={10} /> {dt}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Upload Date */}
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(date)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(itemId)}
                        disabled={deletingId === itemId}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete file dataset"
                      >
                        {deletingId === itemId ? (
                          <FiLoader className="animate-spin text-rose-500" size={15} />
                        ) : (
                          <FiTrash2 size={15} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadHistory;
