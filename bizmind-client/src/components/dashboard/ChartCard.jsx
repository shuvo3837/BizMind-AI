import React, { useState } from 'react';

export const ChartCard = ({ title, subtitle, children, action }) => {
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {action}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">This Year</option>
          </select>
        </div>
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
};

export default ChartCard;
