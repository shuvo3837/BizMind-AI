import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

export const InsightCard = ({ insight, onApply }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle className="text-amber-500" size={18} />;
      case 'success':
        return <FiTrendingUp className="text-emerald-500" size={18} />;
      case 'product':
        return <FiShoppingBag className="text-indigo-500" size={18} />;
      default:
        return <HiSparkles className="text-indigo-500" size={18} />;
    }
  };

  const getBadgeStyle = (impact) => {
    switch (impact) {
      case 'High Impact':
      case 'Critical':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'High Growth':
      case 'Positive Trend':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200/60 dark:border-slate-800">
              {getIcon(insight.type)}
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{insight.title}</h4>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(insight.impact)}`}>
            {insight.impact}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed my-2">
          {insight.description}
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 mt-2">
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
          <FiCheckCircle size={13} className="text-emerald-500" /> {insight.confidence}% AI Confidence
        </span>
        <button
          onClick={() => onApply && onApply(insight)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold inline-flex items-center gap-1 transition-colors"
        >
          {insight.actionText || 'Apply Strategy'} <FiArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default InsightCard;
