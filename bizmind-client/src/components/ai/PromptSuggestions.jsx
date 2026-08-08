import React from 'react';
import { Sparkles } from 'lucide-react';

export const PromptSuggestions = ({ onSelect, hasData = true }) => {
  const suggestions = hasData ? [
    'What is my highest revenue product?',
    'Analyze my profit margin and expense breakdown',
    'Which categories generate the most sales?',
    'Give me an executive business summary'
  ] : [
    'How do I upload my business data?',
    'What file types are supported for parsing?',
    'How does BizMind AI calculate real analytics?'
  ];

  return (
    <div className="px-6 py-2.5 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
      <Sparkles size={14} className="text-indigo-600 shrink-0" />
      <span className="text-slate-400 font-semibold shrink-0">Suggestions:</span>
      {suggestions.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(prompt)}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};
