import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Sparkles, Trash2, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { reportService } from '../../services/reportService.js';
import { analyticsService } from '../../services/analyticsService.js';
import { formatDate } from '../../utils/formatters.js';

export const ReportsPage = () => {
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [hasData, setHasData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadInitialData = async () => {
    try {
      const summaryRes = await analyticsService.getSummary();
      const isDataAvailable = summaryRes?.data?.hasData === true;
      setHasData(isDataAvailable);

      const listRes = await reportService.getReports();
      if (listRes?.data) {
        setReports(listRes.data);
      }
    } catch (e) {
      console.error('Error fetching reports data:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleGenerate = async (type) => {
    if (!hasData) {
      setErrorMsg('No business data available. Please upload your CSV or Excel sales data in the Upload Center before generating a report.');
      return;
    }

    setErrorMsg('');
    setGenerating(true);
    try {
      const res = await reportService.generateReport({
        reportType: type,
        title: `${type} Audit Report`
      });

      if (res?.data) {
        setReports([res.data, ...reports]);
      }
    } catch (e) {
      setErrorMsg(e.response?.data?.message || e.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reportService.deleteReport(id);
      setReports((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (e) {
      console.error('Error deleting report:', e);
    }
  };

  const handleDownload = (rep) => {
    const repId = rep._id || rep.id;
    const url = rep.downloadUrl || `/api/report/${repId}/download`;
    window.open(url, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Report Generator & Export Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate verified executive PDFs, financial audits, and inventory reviews from database sales records
          </p>
        </div>

        {/* Warning if no business data uploaded */}
        {!hasData && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs">
            <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">No Business Data Uploaded</p>
              <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                You must upload business CSV or Excel files in the Upload Center before generating verified reports.
              </p>
            </div>
            <Link to="/upload" className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5">
              <Upload size={14} /> Upload Data
            </Link>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Report Generator Controls */}
        <Card title="Generate New Intelligence Report" subtitle="AI compiles financial metrics into downloadable PDF summaries">
          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={() => handleGenerate('Executive Summary')} isLoading={generating} disabled={!hasData} variant="primary">
              <Sparkles size={16} className="mr-2" /> Executive Summary
            </Button>
            <Button onClick={() => handleGenerate('Financial Performance')} isLoading={generating} disabled={!hasData} variant="secondary">
              Financial Audit
            </Button>
            <Button onClick={() => handleGenerate('Sales Analysis')} isLoading={generating} disabled={!hasData} variant="outline">
              Sales Breakdown
            </Button>
            <Button onClick={() => handleGenerate('Inventory Audit')} isLoading={generating} disabled={!hasData} variant="outline">
              Inventory Report
            </Button>
          </div>
        </Card>

        {/* Reports Archive List */}
        <Card title="Report Archive & Export Downloads">
          {reports.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No reports generated yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                {hasData ? 'Click one of the buttons above to compile a PDF report.' : 'Upload business data first to compile verified PDF reports.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((rep) => {
                const repId = rep._id || rep.id;
                const repTitle = rep.reportName || rep.title || 'Intelligence Report';

                return (
                  <div key={repId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{repTitle}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rep.summary}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Generated: {formatDate(rep.createdAt || rep.generatedAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button onClick={() => handleDownload(rep)} variant="outline" size="sm">
                        <Download size={14} className="mr-1.5" /> Download PDF
                      </Button>
                      <button
                        onClick={() => handleDelete(repId)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
