import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Package,
  AlertTriangle,
  Database,
  CalendarClock,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { SalesChart } from '../../components/charts/SalesChart.jsx';
import { ExpenseBreakdown } from '../../components/charts/ExpenseBreakdown.jsx';
import { RevenueTrend } from '../../components/charts/RevenueTrend.jsx';
import { InventoryBarChart } from '../../components/charts/InventoryBarChart.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { analyticsService } from '../../services/analyticsService.js';

const formatMoney = (n) => `$${Number(n || 0).toLocaleString()}`;
const formatNumber = (n) => Number(n || 0).toLocaleString();

const formatDateRange = (range) => {
  if (!range || (!range.start && !range.end)) return 'No dated records';
  if (range.start && range.end && range.start !== range.end) {
    return `${range.start} → ${range.end}`;
  }
  return range.start || range.end || '—';
};

const formatTimestamp = (t) => {
  if (!t) return 'Never';
  try {
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return 'Never';
    return d.toLocaleString();
  } catch {
    return 'Never';
  }
};

const KpiCard = ({ title, value, subtitle, icon: Icon, accent = 'blue' }) => {
  const accents = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {Icon && (
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${accents[accent]}`}>
            <Icon size={15} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</p>
      )}
    </Card>
  );
};

const ProfitPanel = ({ profit }) => {
  if (!profit) return null;
  const hasOpEx = profit.hasOperatingExpenseData;
  return (
    <Card title="Profit Analysis" subtitle="Revenue → COGS → Operating expenses → Net profit">
      <div className="space-y-3">
        <Row label="Revenue" value={formatMoney(profit.revenue)} tone="default" />
        <Row label="− Cost of goods sold" value={formatMoney(profit.cogs)} tone="muted" />
        <div className="border-t border-slate-200 dark:border-slate-800" />
        <Row label="Gross profit" value={formatMoney(profit.grossProfit)} tone="strong" />

        <div className="pt-2">
          {hasOpEx ? (
            <>
              <Row label="− Operating expenses" value={formatMoney(profit.operatingExpenses)} tone="muted" />
              <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
              <Row
                label="Net profit"
                value={formatMoney(profit.netProfit)}
                tone={profit.netProfit >= 0 ? 'positive' : 'negative'}
                sub={
                  profit.netProfitMargin != null
                    ? `${profit.netProfitMargin.toFixed(1)}% net margin`
                    : null
                }
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
              Operating expense data unavailable — upload expense rows (rent, payroll, utilities, etc.) to compute net profit.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const Row = ({ label, value, tone = 'default', sub }) => {
  const tones = {
    default: 'text-slate-800 dark:text-slate-100',
    strong: 'text-slate-900 dark:text-white font-semibold',
    positive: 'text-emerald-600 dark:text-emerald-400 font-semibold',
    negative: 'text-rose-600 dark:text-rose-400 font-semibold',
    muted: 'text-slate-500 dark:text-slate-400',
  };
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <div className="text-right">
        <span className={tones[tone]}>{value}</span>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
};

const DataQualityStrip = ({ dataQuality }) => {
  if (!dataQuality) return null;
  return (
    <Card className="bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
        <Stat icon={<Database size={13} />} label="Data source" value={dataQuality.source} />
        <Stat
          icon={<Package size={13} />}
          label="Records analyzed"
          value={`${formatNumber(dataQuality.recordsAnalyzed)} (${
            dataQuality.salesRecords +
            ' sales · ' +
            dataQuality.expenseRecords +
            ' expenses · ' +
            dataQuality.inventoryRecords +
            ' inv'
          })`}
        />
        <Stat icon={<CalendarClock size={13} />} label="Date range" value={formatDateRange(dataQuality.dateRange)} />
        <Stat
          icon={<CalendarClock size={13} />}
          label="Last updated"
          value={formatTimestamp(dataQuality.lastUpdated)}
        />
      </div>
      {dataQuality.lastUploadName && (
        <p className="mt-2 text-[11px] text-slate-400">
          Latest upload: <span className="font-semibold text-slate-600 dark:text-slate-300">{dataQuality.lastUploadName}</span>
        </p>
      )}
    </Card>
  );
};

const Stat = ({ icon, label, value }) => (
  <div>
    <p className="flex items-center gap-1 text-slate-400 uppercase tracking-wider text-[10px]">
      {icon}
      {label}
    </p>
    <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
  </div>
);

const NoDataState = () => (
  <Card>
    <div className="py-10 text-center">
      <Database size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
      <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">No business data yet</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        Upload a CSV, XLSX, JSON, PDF, or image of your sales, expense, or inventory records to populate this dashboard with real insights.
      </p>
      <Link
        to="/upload"
        className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
      >
        Upload data
      </Link>
    </div>
  </Card>
);

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await analyticsService.getDashboardData();
        if (!mounted) return;
        setData(res?.data || res || null);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Deep Financial Analytics & Visualizations">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading analytics…</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Deep Financial Analytics & Visualizations">
        <Alert type="error" message={error} />
      </DashboardLayout>
    );
  }

  if (!data || !data.hasData) {
    return (
      <DashboardLayout title="Deep Financial Analytics & Visualizations">
        <NoDataState />
      </DashboardLayout>
    );
  }

  const kpis = data.kpis || {};
  const charts = data.charts || {};
  const profit = data.profitAnalysis;
  const dq = data.dataQuality;
  const insights = data.insights || {};

  return (
    <DashboardLayout title="Deep Financial Analytics & Visualizations">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard
          title="Total Revenue"
          value={formatMoney(kpis.totalRevenue)}
          subtitle={`${formatNumber(kpis.totalSales)} sale${
            kpis.totalSales === 1 ? '' : 's'
          } • avg ${formatMoney(kpis.averageOrderValue)}/order`}
          icon={DollarSign}
          accent="emerald"
        />
        <KpiCard
          title="Total Profit"
          value={formatMoney(kpis.totalProfit)}
          subtitle={
            kpis.profitMargin != null
              ? `${kpis.profitMargin.toFixed(1)}% gross margin`
              : 'Gross margin unavailable'
          }
          icon={TrendingUp}
          accent="blue"
        />
        <KpiCard
          title="Total Expenses"
          value={formatMoney(kpis.totalExpenses)}
          subtitle={
            (kpis.totalExpenses || 0) > 0
              ? 'Operating expenses recorded'
              : 'No operating expense data'
          }
          icon={Receipt}
          accent="amber"
        />
        <KpiCard
          title="Units Sold"
          value={formatNumber(kpis.totalUnitsSold)}
          subtitle={`${formatNumber(kpis.totalProducts)} distinct product${
            kpis.totalProducts === 1 ? '' : 's'
          }`}
          icon={ShoppingCart}
          accent="violet"
        />
        <KpiCard
          title="Inventory Items"
          value={formatNumber(data.counts?.inventory)}
          subtitle={`Valued at ${formatMoney(kpis.totalInventoryValue)}`}
          icon={Package}
          accent="slate"
        />
        <KpiCard
          title="Low Stock Items"
          value={formatNumber((data.lowStockItems || []).length)}
          subtitle={
            (data.lowStockItems || []).length > 0
              ? 'Below reorder level'
              : 'All products healthy'
          }
          icon={AlertTriangle}
          accent={(data.lowStockItems || []).length > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Profit + Data Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProfitPanel profit={profit} />
        <DataQualityStrip dataQuality={dq} />
      </div>

      {/* Sales & Expense charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={charts.salesByCategory || []} insight={insights.salesByCategory} />
        <ExpenseBreakdown data={charts.expenseAllocation || []} insight={insights.expenseAllocation} />
      </div>

      {/* Trend & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RevenueTrend
          data={charts.revenueTrend || []}
          granularity={charts.revenueTrendGranularity}
          trendStats={charts.trendStats}
          insight={insights.revenueTrend}
        />
        <InventoryBarChart data={data.inventoryVsReorder || []} insight={insights.inventory} />
      </div>

      <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 text-center">
        Every figure on this page comes directly from your uploaded business data. No estimates, no projections.
      </p>
    </DashboardLayout>
  );
};
