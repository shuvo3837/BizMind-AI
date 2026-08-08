import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiCpu, FiBarChart2, FiFileText, FiBriefcase, FiArrowRight } from 'react-icons/fi';

export const QuickAction = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Upload Data',
      desc: 'Parse CSV, Excel or PDF invoices',
      icon: FiUploadCloud,
      path: '/upload',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
    },
    {
      title: 'Generate Report',
      desc: 'Export executive PDF summaries',
      icon: FiFileText,
      path: '/reports',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-100 dark:border-purple-900/50'
    },
    {
      title: 'Ask AI',
      desc: 'Consult Gemini CFO assistant',
      icon: FiCpu,
      path: '/ai-chat',
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
    },
    {
      title: 'View Analytics',
      desc: 'Examine detailed growth metrics',
      icon: FiBarChart2,
      path: '/analytics',
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
    },
    {
      title: 'Business Profile',
      desc: 'Update company revenue targets',
      icon: FiBriefcase,
      path: '/business-profile',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Intelligence Workflows</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Streamline operational tasks and strategic insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={() => navigate(act.path)}
              className="group p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-800/60 text-left transition-all duration-200 flex flex-col justify-between h-full"
            >
              <div>
                <div className={`p-2.5 rounded-xl w-max border ${act.color} mb-3 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={20} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {act.desc}
                </p>
              </div>

              <div className="mt-3 flex items-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Launch <FiArrowRight className="ml-1" size={12} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAction;
