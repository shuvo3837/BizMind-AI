import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export const Header = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">{title}</h1>
        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          Live Analysis
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block w-64">
          <input
            type="text"
            placeholder="Search data points..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
        </div>

        <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
        </button>

        <div className="flex items-center gap-3 border-l pl-6 border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user?.name || 'Alex Rivera'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium mt-0.5">{user?.companyName || 'CEO, Rivera Logistics'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-white dark:border-slate-800 shadow-xs flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            {user?.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase() : 'AR'}
          </div>
        </div>
      </div>
    </header>
  );
};
