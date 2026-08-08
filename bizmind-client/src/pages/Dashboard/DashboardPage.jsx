import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiDollarSign, FiShoppingBag, FiTrendingUp, FiCreditCard, 
  FiBox, FiZap, FiArrowRight, FiFileText, FiRefreshCw, FiUpload, FiPieChart, FiBarChart2
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

import { AuthContext } from '../../context/AuthContext.jsx';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { StatsCard } from '../../components/dashboard/StatsCard.jsx';
import { ChartCard } from '../../components/dashboard/ChartCard.jsx';
import { QuickAction } from '../../components/dashboard/QuickAction.jsx';
import { UploadsTable } from '../../components/dashboard/UploadsTable.jsx';
import { InsightCard } from '../../components/dashboard/InsightCard.jsx';
import { ReportCard } from '../../components/dashboard/ReportCard.jsx';
import { analyticsService } from '../../services/analyticsService.js';
import { reportService } from '../../services/reportService.js';

export const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      hasData: false,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalSales: 0,
      totalUnitsSold: 0,
      totalProducts: 0,
      profitMargin: 0,
      averageOrderValue: 0,
      growthRate: 0,
      growthStatus: 'No business data available'
    },
    revenueTrend: [],
    salesByCategory: [],
    inventoryHealth: [],
    insights: []
  });
  const [reportsList, setReportsList] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getDashboardData();
      if (res?.data) {
        setDashboardData(res.data);
      }
      const repRes = await reportService.getReports();
      if (repRes?.data) {
        setReportsList(repRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const overview = dashboardData?.overview || {};
  const hasData = overview.hasData === true;
  const revenueTrend = dashboardData?.revenueTrend || [];
  const salesByCategory = dashboardData?.salesByCategory || [];
  const insightsList = dashboardData?.insights || [];

  const handleApplyInsight = (insight) => {
    if (insight.id === 'ins_empty') {
      navigate('/upload');
    } else {
      alert(`AI Recommendation: "${insight.title}"\n${insight.description}`);
    }
  };

  const handleViewReport = (report) => {
    navigate('/reports');
  };

  const handleDownloadReport = (report) => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    } else {
      navigate('/reports');
    }
  };

  return (
    <DashboardLayout>
      {/* 1. Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-900/60 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              <HiSparkles size={14} className="text-indigo-400 animate-pulse" /> BizMind AI Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name ? user.name.split(' ')[0] : 'Business Owner'}! 👋
            </h2>
            <p className="text-sm font-semibold text-indigo-200">
              {hasData ? 'Verified Real Business Analytics' : 'No Business Data Uploaded'}
            </p>
            <p className="text-xs text-slate-300/80 max-w-2xl leading-relaxed">
              {hasData ? (
                <>Your uploaded data shows <span className="text-emerald-400 font-bold">${overview.totalRevenue?.toLocaleString()}</span> gross revenue across <span className="text-indigo-300 font-bold">{overview.totalSales} transactions</span> with a <span className="text-amber-300 font-bold">{overview.profitMargin}%</span> profit margin.</>
              ) : (
                <>Upload your business CSV, Excel (.xlsx), or PDF financial statements in the <span className="text-indigo-300 font-bold">Upload Center</span> to generate live charts, KPIs, and AI reasoning.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2"
              title="Refresh Data"
            >
              <FiRefreshCw size={15} className={isRefreshing ? 'animate-spin text-indigo-400' : ''} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {hasData ? (
              <button
                onClick={() => navigate('/ai-chat')}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
              >
                <HiSparkles size={16} />
                <span>Ask AI Consultant</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/upload')}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
              >
                <FiUpload size={16} />
                <span>Upload Center</span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. KPI 6 Statistic Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Revenue"
          value={hasData ? `$${overview.totalRevenue?.toLocaleString()}` : '$0'}
          change={hasData ? `${overview.growthRate > 0 ? '+' : ''}${overview.growthRate}%` : '0%'}
          isPositive={overview.growthRate >= 0}
          icon={FiDollarSign}
          subtitle={hasData ? 'Verified total' : 'No data uploaded'}
          color="indigo"
        />
        <StatsCard
          title="Total Sales"
          value={hasData ? `${overview.totalSales} Orders` : '0 Orders'}
          change={hasData ? `${overview.totalUnitsSold} Units` : '0 Units'}
          isPositive={true}
          icon={FiShoppingBag}
          subtitle={hasData ? 'Transaction volume' : 'No data uploaded'}
          color="emerald"
        />
        <StatsCard
          title="Net Profit"
          value={hasData ? `$${overview.totalProfit?.toLocaleString()}` : '$0'}
          change={hasData ? `${overview.profitMargin}% Margin` : '0% Margin'}
          isPositive={overview.totalProfit >= 0}
          icon={FiTrendingUp}
          subtitle={hasData ? 'Revenue - Cost' : 'No data uploaded'}
          color="purple"
        />
        <StatsCard
          title="Total Expenses"
          value={hasData ? `$${overview.totalCost?.toLocaleString()}` : '$0'}
          change={hasData ? 'Operating COGS' : '0'}
          isPositive={true}
          icon={FiCreditCard}
          subtitle={hasData ? 'Direct costs' : 'No data uploaded'}
          color="blue"
        />
        <StatsCard
          title="Products Cataloged"
          value={hasData ? `${overview.totalProducts} SKUs` : '0 SKUs'}
          change={hasData ? 'Unique Products' : '0'}
          isPositive={hasData}
          icon={FiBox}
          subtitle={hasData ? 'In dataset' : 'No data uploaded'}
          color="amber"
        />
        <StatsCard
          title="Avg Order Value"
          value={hasData ? `$${overview.averageOrderValue}` : '$0'}
          change={hasData ? 'Per Transaction' : '0'}
          isPositive={hasData}
          icon={FiZap}
          subtitle={hasData ? 'Revenue / Sales' : 'No data uploaded'}
          color="indigo"
        />
      </section>

      {/* 3. Quick Actions */}
      <section>
        <QuickAction />
      </section>

      {/* 4. Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Revenue Trend */}
        <ChartCard
          title="Revenue & Profit Trajectory"
          subtitle="Real monthly revenue and net income"
        >
          {hasData && revenueTrend.length > 0 ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`} />
                  <Tooltip
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
              <FiBarChart2 className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No business data available</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">Upload CSV or Excel files in the Upload Center to plot revenue trends.</p>
              <Link to="/upload" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                <FiUpload size={14} /> Go to Upload Center
              </Link>
            </div>
          )}
        </ChartCard>

        {/* Bar Chart: Sales vs Cost */}
        <ChartCard
          title="Sales vs Cost Breakdown"
          subtitle="Monthly gross revenue versus operational costs"
        >
          {hasData && revenueTrend.length > 0 ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`} />
                  <Tooltip
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cost" name="Expenses / Cost" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
              <FiBarChart2 className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No business data available</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">Upload CSV or Excel files in the Upload Center to analyze sales vs costs.</p>
              <Link to="/upload" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                <FiUpload size={14} /> Go to Upload Center
              </Link>
            </div>
          )}
        </ChartCard>

        {/* Pie Chart: Category Distribution */}
        <ChartCard
          title="Category Distribution"
          subtitle="Revenue contribution across product categories"
        >
          {hasData && salesByCategory.length > 0 ? (
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || entry.fill || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
              <FiPieChart className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No category breakdown available</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">Upload category-tagged CSV datasets to inspect market share.</p>
              <Link to="/upload" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                <FiUpload size={14} /> Go to Upload Center
              </Link>
            </div>
          )}
        </ChartCard>
      </section>

      {/* 5. Recent Uploads Table */}
      <section>
        <UploadsTable />
      </section>

      {/* 6. AI Insights Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HiSparkles className="text-indigo-600 dark:text-indigo-400" /> Calculated AI Strategic Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated recommendations computed strictly from verified database metrics</p>
          </div>
          <button
            onClick={() => navigate('/ai-chat')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Explore AI Chat <FiArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insightsList.map((insight) => (
            <InsightCard key={insight.id} insight={insight} onApply={handleApplyInsight} />
          ))}
        </div>
      </section>

      {/* 7. Reports Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiFileText className="text-indigo-600 dark:text-indigo-400" /> Business Reports & PDF Downloads
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Export verified financial audits and executive slide decks</p>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Report Generator <FiArrowRight size={13} />
          </button>
        </div>

        {reportsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportsList.slice(0, 4).map((report) => (
              <ReportCard
                key={report._id || report.id}
                report={report}
                onView={handleViewReport}
                onDownload={handleDownloadReport}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <FiFileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No reports generated yet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">Upload business data to generate your first PDF intelligence audit.</p>
            <button
              onClick={() => navigate('/reports')}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Generate Report
            </button>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default DashboardPage;
