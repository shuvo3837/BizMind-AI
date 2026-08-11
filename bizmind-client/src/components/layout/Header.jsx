import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Mail,
  Briefcase,
  Building2,
  Globe,
  Users,
  Target,
  Coins,
  Pencil,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useBusiness } from '../../context/BusinessContext.jsx';

const formatMoney = (value, currency) => {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `${currency || 'USD'} ${n.toLocaleString()}`;
  }
};

export const Header = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const { business } = useBusiness();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const displayName = user?.name || 'Alex Rivera';
  const companyName = business?.companyName || user?.companyName || 'Rivera Logistics';
  const roleLabel = (user?.role || 'ceo').toString().toUpperCase();
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleEditProfile = () => {
    setOpen(false);
    navigate('/business-profile');
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

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

        <div className="relative" ref={wrapperRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-3 border-l pl-6 border-slate-200 dark:border-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-md pr-2"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium mt-0.5">
                {roleLabel}, {companyName}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-white dark:border-slate-800 shadow-xs flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
              {initials}
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform hidden sm:block ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-sm border border-white/30">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{displayName}</p>
                    <p className="text-[11px] text-indigo-100 truncate flex items-center gap-1 mt-0.5">
                      <Briefcase size={11} /> {roleLabel}, {companyName}
                    </p>
                  </div>
                </div>
                {user?.email && (
                  <p className="text-[11px] text-indigo-100 truncate flex items-center gap-1.5 mt-3">
                    <Mail size={11} /> {user.email}
                  </p>
                )}
              </div>

              <div className="p-4 space-y-2.5 text-xs">
                <DetailRow icon={Building2} label="Company" value={companyName} />
                {business?.industry && (
                  <DetailRow icon={Briefcase} label="Industry" value={business.industry} />
                )}
                {business?.website && (
                  <DetailRow icon={Globe} label="Website" value={business.website} />
                )}
                {business?.employeesCount > 0 && (
                  <DetailRow
                    icon={Users}
                    label="Employees"
                    value={String(business.employeesCount)}
                  />
                )}
                {business?.monthlyTarget > 0 && (
                  <DetailRow
                    icon={Target}
                    label="Monthly Target"
                    value={formatMoney(business.monthlyTarget, business.currency)}
                  />
                )}
                {business?.currency && (
                  <DetailRow icon={Coins} label="Currency" value={business.currency} />
                )}
                {business?.description && (
                  <div className="pt-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                      About
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                      {business.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 p-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Pencil size={13} /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={13} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
      <Icon size={11} /> {label}
    </span>
    <span className="text-slate-800 dark:text-slate-200 font-semibold text-right truncate max-w-[60%]">
      {value}
    </span>
  </div>
);
