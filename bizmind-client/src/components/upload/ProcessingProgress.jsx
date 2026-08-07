import React from 'react';
import { Card } from '../common/Card.jsx';
import { Spinner } from '../common/Spinner.jsx';

export const ProcessingProgress = ({ progress = 0, fileName }) => {
  return (
    <Card className="mt-4 border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20">
      <div className="flex items-center gap-3">
        <Spinner size="md" />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Parsing & Modeling Data: {fileName || 'Uploaded Document'}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
};
