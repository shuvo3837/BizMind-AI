import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  BrainCircuit,
  BarChart3,
  UploadCloud,
  Bot,
  FileSpreadsheet,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Zap size={14} className="text-indigo-600" /> AI-Powered Business Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Turn Business Data into <span className="text-indigo-600 dark:text-indigo-400">Actionable Growth</span>
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload CSVs, Excel files, PDFs, or invoices. BizMind AI automatically parses metrics, generates executive dashboards, and provides strategic CFO guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button onClick={() => navigate('/register')} size="lg" variant="primary">
              Launch BizMind AI <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button onClick={() => navigate('/dashboard')} size="lg" variant="outline">
              Explore Live Demo
            </Button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <UploadCloud size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Instant Multi-Format Parsing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload sales spreadsheets, expense logs, or receipts. Multi-modal AI handles parsing automatically.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Real-Time Dashboards</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track MRR, CAC, LTV, profit margins, and inventory health with automated visual charts.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Bot size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Gemini AI CFO Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ask complex business strategy questions, simulate profit scenarios, and receive instant recommendations.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
