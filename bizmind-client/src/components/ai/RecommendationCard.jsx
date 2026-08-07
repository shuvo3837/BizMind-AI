import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Badge } from '../common/Badge.jsx';

export const RecommendationCard = ({ title, impact, confidence, description, type }) => {
  return (
    <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl p-4 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">{title}</span>
        </div>
        <Badge variant="success">{impact}</Badge>
      </div>

      <p className="text-xs text-indigo-950 dark:text-indigo-200/90 leading-relaxed my-2">
        {description}
      </p>

      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-indigo-200/60 dark:border-indigo-900/80">
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
          <ShieldCheck size={14} className="text-emerald-500" /> {confidence}% AI Confidence
        </span>
        <button className="text-indigo-700 dark:text-indigo-300 font-bold hover:underline inline-flex items-center gap-1">
          Apply Strategy <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
