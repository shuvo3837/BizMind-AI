import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Bot, FileText, BarChart3 } from 'lucide-react';
import { Card } from '../common/Card.jsx';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { title: 'Upload New Data', desc: 'CSV, Excel, PDF analysis', icon: UploadCloud, path: '/upload', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' },
    { title: 'Ask AI Consultant', desc: 'Instant growth strategies', icon: Bot, path: '/ai-chat', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
    { title: 'View Analytics', desc: 'Deep financial insights', icon: BarChart3, path: '/analytics', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
    { title: 'Generate Report', desc: 'Export executive summary', icon: FileText, path: '/reports', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' }
  ];

  return (
    <Card title="Quick Intelligence Actions" subtitle="Streamline your decision-making workflows">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={() => navigate(act.path)}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-left transition-all duration-150"
            >
              <div className={`p-2.5 rounded-lg ${act.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{act.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
