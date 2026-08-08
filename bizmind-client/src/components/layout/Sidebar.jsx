import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiUploadCloud, FiBarChart2, FiCpu, FiFileText, 
  FiBriefcase, FiSettings, FiUser, FiLogOut, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext.jsx';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: FiHome },
    { title: 'Upload Center', path: '/upload', icon: FiUploadCloud },
    { title: 'Analytics', path: '/analytics', icon: FiBarChart2 },
    { title: 'AI Assistant', path: '/ai-chat', icon: FiCpu },
    { title: 'Reports', path: '/reports', icon: FiFileText },
    { title: 'Business Profile', path: '/business-profile', icon: FiBriefcase },
    { title: 'Settings', path: '/settings', icon: FiSettings },
    { title: 'Profile', path: '/settings?tab=profile', icon: FiUser },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-0 z-50 h-screen bg-[#0f172a] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 shrink-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div>
          {/* Header & Logo */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <FiCpu size={20} />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-extrabold text-lg tracking-tight text-white whitespace-nowrap">
                  BizMind <span className="text-indigo-400">AI</span>
                </span>
              )}
            </NavLink>

            {/* Collapse button for desktop */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {(!isCollapsed || isMobileOpen) && (
              <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Main Menu
              </p>
            )}

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm font-bold border-l-4 border-indigo-300'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed && !isMobileOpen ? item.title : ''}
                >
                  <Icon size={18} className="shrink-0" />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.title}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Account Section */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {(!isCollapsed || isMobileOpen) && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-300">
              <p className="font-bold text-indigo-300 mb-0.5">Enterprise Plan</p>
              <p className="text-[11px] text-slate-400">Gemini 2.5 Flash active</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors ${
              isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
            }`}
            title="Logout"
          >
            <FiLogOut size={18} className="shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
