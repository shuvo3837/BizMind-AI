import React from 'react';
import { Bot, User } from 'lucide-react';

export const ChatMessage = ({ sender, text }) => {
  const isAI = sender === 'ai';

  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
        isAI
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
      }`}>
        {isAI ? <Bot size={16} /> : <User size={16} />}
      </div>

      <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
        isAI
          ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-xs'
          : 'bg-indigo-600 text-white rounded-tr-xs'
      }`}>
        {text}
      </div>
    </div>
  );
};
