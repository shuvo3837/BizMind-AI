import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} className="text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            BizMind AI &copy; 2026. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">API Documentation</a>
        </div>
      </div>
    </footer>
  );
};
