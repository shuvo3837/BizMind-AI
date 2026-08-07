import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({ type = 'info', message, children }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    error: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
  };

  const icons = {
    info: <Info size={18} className="shrink-0" />,
    success: <CheckCircle size={18} className="shrink-0" />,
    warning: <AlertTriangle size={18} className="shrink-0" />,
    error: <AlertCircle size={18} className="shrink-0" />
  };

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs font-medium ${styles[type]}`}>
      {icons[type]}
      <div>{message || children}</div>
    </div>
  );
};
