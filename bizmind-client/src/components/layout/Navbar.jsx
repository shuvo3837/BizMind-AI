import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiBell, FiSun, FiMoon, FiUser, FiSettings, FiLogOut, 
  FiMenu, FiX, FiCheck, FiChevronDown 
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const notifications = [
    { id: 1, title: 'AI Recommendation Ready', desc: 'SaaS expansion opportunity detected', time: '10m ago', unread: true },
    { id: 2, title: 'Stock Threshold Warning', desc: 'Smart Hub units down to 12 items', time: '1h ago', unread: true },
    { id: 3, title: 'Monthly Audit Generated', desc: 'July financial report is ready to download', time: '3h ago', unread: false }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile / Collapsible Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Navigation"
        >
          {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        {/* Brand / Title Banner */}
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="font-bold text-slate-800 dark:text-white text-base tracking-tight">
            Dashboard
          </span>
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Analysis
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Bar */}
        <div className="relative w-36 sm:w-64 lg:w-72">
          <FiSearch size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search metrics, reports, AI insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/80 border-none rounded-full py-1.5 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <FiSun size={18} className="text-amber-400" /> : <FiMoon size={18} />}
        </button>

        {/* Notifications Icon with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  2 Unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-4" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-indigo-500/20">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'AR'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                {user?.name || 'Alex Rivera'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {user?.companyName || 'CEO, Rivera Logistics'}
              </p>
            </div>
            <FiChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Alex Rivera'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email || 'alex@bizmind.ai'}</p>
              </div>

              <button
                onClick={() => { setShowUserDropdown(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <FiUser size={14} /> Profile Settings
              </button>
              <button
                onClick={() => { setShowUserDropdown(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <FiSettings size={14} /> Preferences
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
              >
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
