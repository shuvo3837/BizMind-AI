import React, { useState, useEffect } from 'react';
import { FiCalendar, FiTrendingUp, FiDollarSign, FiShoppingBag, FiBox, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { SalesChart } from '../../components/charts/SalesChart.jsx';
import { ExpenseBreakdown } from '../../components/charts/ExpenseBreakdown.jsx';
import { RevenueTrend } from '../../components/charts/RevenueTrend.jsx';
import { InventoryBarChart } from '../../components/charts/InventoryBarChart.jsx';
import { analyticsService } from '../../services/analyticsService.js';

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState({});
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes, catRes, topRes, invRes] = await Promise.all([
        analyticsService.getSummary(period),
        analyticsService.getRevenueTrend(period),
        analyticsService.getCategoryPerformance(period),
        analyticsService.getTopProducts(period, 5),
        analyticsService.getInventory()
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (trendRes?.data) setRevenueTrend(trendRes.data);
      if (catRes?.data) setCategoryData(catRes.data);
      if (topRes?.data) setTopProducts(topRes.data);
      if (invRes?.data) setInventoryData(invRes.data);
    } catch (err) {
      console.error('Failed to load deep analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const hasData = summary.hasData === true;

  return (
    <DashboardLayout>
      {/* Page Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Deep Business Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified financial metrics and performance trends calculated directly from your database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
            <FiCalendar className="text-indigo-600 dark:text-indigo-400" size={14} />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            title="Refresh analytics calculations"
          >
            <FiRefreshCw size={15} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {hasData ? `$${summary.totalRevenue?.toLocaleString()}` : '$0'}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <FiTrendingUp size={12} /> {hasData ? `AOV: $${summary.averageOrderValue}` : 'No business data available'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Operating Expenses</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {hasData ? `$${summary.totalCost?.toLocaleString()}` : '$0'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {hasData ? 'COGS & Operating costs' : 'Expense data is not available in the uploaded datasets.'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Operating Profit</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {hasData ? `$${summary.totalProfit?.toLocaleString()}` : '$0'}
          </h3>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">
            {hasData ? `Margin: ${summary.profitMargin}%` : '0% Margin'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sales Transactions</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {hasData ? summary.totalSales : 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {hasData ? `${summary.totalUnitsSold} total units sold` : '0 units'}
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalesChart data={categoryData} isDataUploaded={hasData} />
        <ExpenseBreakdown data={categoryData} isDataUploaded={hasData} />
        <RevenueTrend data={revenueTrend} isDataUploaded={hasData} />
        <InventoryBarChart data={inventoryData} isDataUploaded={hasData} />
      </div>

      {/* Top Performing Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Revenue Driving Products</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ranked by calculated sales volume from database records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Units Sold</th>
                <th className="py-2.5 px-3">Total Revenue</th>
                <th className="py-2.5 px-3 text-right">Profit Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {!hasData || topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No business data available. Upload your business data from the Upload Center to start analysis.
                  </td>
                </tr>
              ) : (
                topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{p.productName}</td>
                    <td className="py-3 px-3 text-slate-500">{p.category}</td>
                    <td className="py-3 px-3">{p.totalUnits}</td>
                    <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">${p.totalRevenue?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${p.totalProfit?.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
