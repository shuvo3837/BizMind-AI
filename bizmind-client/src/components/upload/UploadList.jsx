import React from 'react';
import { FileText, CheckCircle2, Clock, Loader2, AlertCircle, Trash2, BarChart3, FilePlus2 } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Badge } from '../common/Badge.jsx';
import { formatDate, formatFileSize } from '../../utils/formatters.js';

const statusVariant = {
  completed: 'success',
  processed: 'success',
  failed: 'error',
  processing: 'info',
  pending: 'warning',
};

const StatusBadge = ({ status }) => {
  const variant = statusVariant[status] || 'default';
  const icon =
    status === 'completed' || status === 'processed' ? (
      <CheckCircle2 size={12} className="mr-1" />
    ) : status === 'failed' ? (
      <AlertCircle size={12} className="mr-1" />
    ) : (
      <Clock size={12} className="mr-1" />
    );
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
  return (
    <Badge variant={variant}>
      {icon} {label}
    </Badge>
  );
};

export const UploadList = ({ uploads = [], loading = false, onDelete, onViewAnalysis, onGenerateReport, busyActionId }) => {
  return (
    <Card title="Recent File Uploads" subtitle="History of processed documents and extracted data">
      {loading && uploads.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500 dark:text-slate-400">
          <Loader2 size={14} className="animate-spin" /> Loading upload history...
        </div>
      )}

      {!loading && uploads.length === 0 && (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No uploads yet. Drop a CSV, Excel, PDF, or image file above to get started.
        </div>
      )}

      {uploads.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {uploads.map((file) => {
            const id = file._id || file.id;
            const name = file.originalName || file.name || 'Untitled file';
            const size = file.sizeBytes ?? file.size ?? 0;
            const records =
              file.recordsProcessed ??
              file.recordsCount ??
              file.summary?.total ??
              file.summary?.records ??
              0;
            const fileType = (file.fileType || file.type || 'FILE').toString().toUpperCase();
            const createdAt = file.createdAt || file.uploadedAt;

            return (
              <div key={id || name} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {fileType}
                      {size ? ` • ${formatFileSize(size)}` : ''}
                      {records ? ` • ${records} records extracted` : ''}
                      {createdAt ? ` • ${formatDate(createdAt)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={file.status} />
                  {id && (
                    <>
                      <button
                        type="button"
                        onClick={() => onViewAnalysis?.(id)}
                        disabled={busyActionId === id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors disabled:opacity-50"
                        aria-label={`View analysis for ${name}`}
                        title="View analysis"
                      >
                        <BarChart3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onGenerateReport?.(id)}
                        disabled={busyActionId === id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors disabled:opacity-50"
                        aria-label={`Generate report for ${name}`}
                        title="Generate report"
                      >
                        <FilePlus2 size={14} />
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          aria-label={`Delete ${name}`}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
