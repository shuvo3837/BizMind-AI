import React from 'react';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Badge } from '../common/Badge.jsx';
import { formatDate, formatFileSize } from '../../utils/formatters.js';

export const UploadList = ({ uploads = [] }) => {
  const list = uploads.length > 0 ? uploads : [
    { id: '1', originalName: 'Q2_Sales_Transactions.csv', fileType: 'CSV', sizeBytes: 1245000, recordsCount: 412, status: 'completed', createdAt: '2026-08-01T14:30:00.000Z' },
    { id: '2', originalName: 'Operating_Expenses_July.xlsx', fileType: 'Excel', sizeBytes: 856000, recordsCount: 185, status: 'completed', createdAt: '2026-08-04T09:15:00.000Z' },
    { id: '3', originalName: 'Inventory_Audit_August.pdf', fileType: 'PDF', sizeBytes: 3420000, recordsCount: 94, status: 'completed', createdAt: '2026-08-06T16:45:00.000Z' }
  ];

  return (
    <Card title="Recent File Uploads" subtitle="History of processed documents and extracted data">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {list.map((file) => (
          <div key={file.id} className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <FileText size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{file.originalName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatFileSize(file.sizeBytes)} • {file.recordsCount} records extracted • {formatDate(file.createdAt)}
                </p>
              </div>
            </div>
            <Badge variant="success">
              <CheckCircle2 size={12} className="mr-1" /> Processed
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
