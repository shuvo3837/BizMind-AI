import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export const StatsCard = ({ title, value, change, isPositive = true, icon: Icon, subtitle, color = 'indigo' }) => {
  const iconBg = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg[color] || iconBg.indigo}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        {change && (
          <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
            isPositive
              ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400'
          }`}>
            {isPositive ? <FiTrendingUp className="mr-1" size={13} /> : <FiTrendingDown className="mr-1" size={13} />}
            {change}
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500 font-medium truncate">{subtitle || 'vs last period'}</span>
      </div>
    </div>
  );
};

export default StatsCard;
