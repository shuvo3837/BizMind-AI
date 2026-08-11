import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Bot,
  FileText,
  Settings,
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Data', path: '/upload', icon: UploadCloud },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Chat', path: '/ai-chat', icon: Bot },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 bg-[#0f172a] text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            BizMind <span className="text-indigo-400">AI</span>
          </span>
        </NavLink>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Navigation
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'active-nav text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-indigo-950/50 border border-indigo-900/60 rounded-xl p-3 text-xs text-indigo-200">
          <p className="font-semibold mb-0.5 text-indigo-300">Pro Account</p>
          <p className="opacity-80 text-[11px]">Using 4.2GB of 10GB storage</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
