import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FileText, Download, Sparkles } from 'lucide-react';
import { reportService } from '../../services/reportService.js';
import { formatDate } from '../../utils/formatters.js';
import { getAuthToken } from '../../utils/storage.js';
import { Alert } from '../../components/common/Alert.jsx';

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
};

const resolveDescription = (rep) => {
  if (typeof rep.description === 'string' && rep.description.trim()) return rep.description;
  if (typeof rep.aiInsights === 'string' && rep.aiInsights.trim()) return rep.aiInsights;

  const s = rep.summary;
  if (s && typeof s === 'object') {
    const revenue = s.totalRevenue ?? s.revenue;
    const profit = s.totalProfit ?? s.profit;
    const sales = s.totalSales ?? s.sales;
    const parts = [];
    if (revenue !== undefined) parts.push(`Revenue ${formatCurrency(revenue)}`);
    if (profit !== undefined) parts.push(`Profit ${formatCurrency(profit)}`);
    if (sales !== undefined) parts.push(`${sales} sales`);
    if (parts.length) return parts.join(' • ');
  }

  return 'Generated from uploaded business data.';
};

export const ReportsPage = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadReports = async () => {
    try {
      const res = await reportService.getReports();
      const payload = res?.data || res;
      const items = Array.isArray(payload) ? payload : (payload?.data || []);
      setReports(items);
    } catch (e) {
      setError(e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (type) => {
    setGenerating(true);
    setError(null);
    try {
      const res = await reportService.generateReport({ reportType: type, title: `${type} Audit` });
      const payload = res?.data || res;
      if (payload) {
        setReports((prev) => [payload, ...prev]);
      }
    } catch (e) {
      setError(e.message || 'Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (rep) => {
    const reportId = rep?.id || rep?._id;
    if (!reportId) {
      setError('Report is missing an id and cannot be exported.');
      return;
    }
    setDownloadingId(reportId);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/report/${reportId}/download?format=html`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Export failed (HTTP ${res.status})`);
      }
      const html = await res.text();
      const win = window.open('', '_blank');
      if (!win) {
        // Pop-up blocked — fall back to downloading the HTML file directly.
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(rep.title || 'report').replace(/\s+/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        try { win.print(); } catch (_) { /* user can still File > Print */ }
      }, 500);
    } catch (e) {
      setError(e.message || 'Failed to export report');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout title="Automated AI Reports & Export Center">
      {error && <Alert type="error" message={error} />}

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
          {loading && <p className="py-4 text-sm text-slate-500">Loading reports…</p>}
          {!loading && reports.length === 0 && <p className="py-4 text-sm text-slate-500">No reports yet. Generate one from your uploaded data.</p>}
          {reports.map((rep) => (
            <div key={rep.id || rep._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mt-0.5">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rep.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{resolveDescription(rep)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Generated: {formatDate(rep.createdAt || rep.generatedAt)}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => handleExport(rep)}
                isLoading={downloadingId === (rep.id || rep._id)}
              >
                <Download size={14} className="mr-1.5" /> Export PDF
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};
