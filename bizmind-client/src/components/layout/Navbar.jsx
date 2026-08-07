import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            BizMind <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button onClick={() => navigate('/dashboard')} variant="primary" size="sm">
              Dashboard <ArrowRight size={14} className="ml-1" />
            </Button>
          ) : (
            <>
              <Link to="/login" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Button onClick={() => navigate('/register')} variant="primary" size="sm">
                Get Started Free
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
