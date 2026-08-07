import React from 'react';
import { Card } from '../common/Card.jsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, change, isPositive = true, icon: Icon, subtitle }) => {
  return (
    <Card className="shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
        {change && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">{subtitle}</p>
      )}
    </Card>
  );
};
