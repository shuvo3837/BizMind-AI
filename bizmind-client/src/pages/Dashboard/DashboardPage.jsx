import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { StatCard } from '../../components/dashboard/StatCard.jsx';
import { QuickActions } from '../../components/dashboard/QuickActions.jsx';
import { SummaryChart } from '../../components/dashboard/SummaryChart.jsx';
import { RecommendationCard } from '../../components/ai/RecommendationCard.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { DollarSign, TrendingUp, Users, ShoppingBag, Package, Receipt, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { analyticsService } from '../../services/analyticsService.js';
import { aiService } from '../../services/aiService.js';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsProvider, setRecommendationsProvider] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dashRes, recRes] = await Promise.allSettled([
          analyticsService.getDashboardData(),
          aiService.getRecommendations()
        ]);

        if (!mounted) return;

        if (dashRes.status === 'fulfilled') {
          setDashboard(dashRes.value?.data || null);
        } else {
          setError(dashRes.reason?.message || 'Failed to load dashboard data');
        }

        if (recRes.status === 'fulfilled') {
          const payload = recRes.value?.data || {};
          setRecommendationsProvider(payload.provider || 'rules');
          const recs = Array.isArray(payload.recommendations)
            ? payload.recommendations
            : [];
          setRecommendations(recs);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = dashboard?.kpis || {};
  const hasData = dashboard?.hasData !== false;

  return (
    <DashboardLayout title="Business Intelligence Overview">
      {error && <Alert type="error" message={error} />}

      {!loading && !hasData && (
        <Alert
          type="info"
          message="No business data yet. Upload a CSV/XLSX/PDF/Image to populate your dashboard."
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(kpis.totalRevenue || 0)}
          icon={DollarSign}
          subtitle="All recorded sales"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(kpis.totalProfit || 0)}
          icon={TrendingUp}
          subtitle={`Margin ${(kpis.profitMargin || 0).toFixed(1)}%`}
        />
        <StatCard
          title="Total Sales"
          value={kpis.totalSales || 0}
          icon={ShoppingBag}
          subtitle={`Units sold ${kpis.totalUnitsSold || 0}`}
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(kpis.totalInventoryValue || 0)}
          icon={Package}
          subtitle={`${kpis.totalProducts || 0} products tracked`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(kpis.totalExpenses || 0)}
          icon={Receipt}
          subtitle="Operating costs"
        />
        <StatCard
          title="Total Cost"
          value={formatCurrency(kpis.totalCost || 0)}
          icon={Wallet}
          subtitle="Goods + expenses"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(kpis.averageOrderValue || 0)}
          icon={Users}
          subtitle="Per transaction"
        />
        <StatCard
          title="Revenue Target"
          value="—"
          icon={TrendingUp}
          subtitle="Set in Business Profile"
        />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SummaryChart
            revenueByCategory={dashboard?.charts?.revenueByCategory || []}
            expenseByCategory={dashboard?.charts?.expenseByCategory || []}
            revenueTrend={dashboard?.charts?.revenueTrend || []}
            profitTrend={dashboard?.charts?.profitTrend || []}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Top {recommendationsProvider === 'gemini' ? 'Gemini' : recommendationsProvider === 'groq' ? 'Groq' : ''} AI Recommendations
          </h3>
          {recommendations.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {recommendationsProvider
                ? 'No recommendations yet. Upload data to generate insights.'
                : 'Loading recommendations...'}
            </div>
          )}
          {recommendations.map((rec, idx) => (
            <RecommendationCard
              key={idx}
              title={rec.title || 'Recommendation'}
              impact={rec.impact || rec.priority || ''}
              confidence={rec.confidence || (rec.priority === 'high' ? 90 : rec.priority === 'medium' ? 75 : 60)}
              description={rec.detail || rec.description || ''}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
