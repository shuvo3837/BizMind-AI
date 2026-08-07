import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FileText, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { reportService } from '../../services/reportService.js';
import { formatDate } from '../../utils/formatters.js';

export const ReportsPage = () => {
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([
    {
      id: 'rep_101',
      title: 'Q2 Executive Growth Audit',
      reportType: 'Executive Summary',
      generatedAt: '2026-08-01T10:00:00.000Z',
      summary: 'Comprehensive financial health report highlighting +14.2% MoM revenue growth.'
    },
    {
      id: 'rep_102',
      title: 'July Financial & Expense Review',
      reportType: 'Financial Performance',
      generatedAt: '2026-08-05T15:30:00.000Z',
      summary: 'Detailed operating expenses audit breakdown and cost savings recommendations.'
    }
  ]);

  const handleGenerate = async (type) => {
    setGenerating(true);
    try {
      const res = await reportService.generateReport({ reportType: type, title: `${type} Audit` });
      if (res?.data) {
        setReports([res.data, ...reports]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Automated AI Reports & Export Center">
      {/* Report Generator Controls */}
      <Card title="Generate New Intelligence Report" subtitle="AI compiles financial summaries and executive slide decks">
        <div className="flex flex-wrap gap-3 mt-4">
          <Button onClick={() => handleGenerate('Executive Summary')} isLoading={generating} variant="primary">
            <Sparkles size={16} className="mr-2" /> Executive Summary
          </Button>
          <Button onClick={() => handleGenerate('Financial Performance')} isLoading={generating} variant="secondary">
            Financial Audit
          </Button>
          <Button onClick={() => handleGenerate('Sales Analysis')} isLoading={generating} variant="outline">
            Sales Breakdown
          </Button>
          <Button onClick={() => handleGenerate('Inventory Audit')} isLoading={generating} variant="outline">
            Inventory Report
          </Button>
        </div>
      </Card>

      {/* Reports History */}
      <Card title="Report Archive & Export Downloads">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports.map((rep) => (
            <div key={rep.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mt-0.5">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rep.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rep.summary}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Generated: {formatDate(rep.generatedAt)}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="shrink-0">
                <Download size={14} className="mr-1.5" /> Export PDF
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};
