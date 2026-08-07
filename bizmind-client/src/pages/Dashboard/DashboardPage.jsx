import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { StatCard } from '../../components/dashboard/StatCard.jsx';
import { QuickActions } from '../../components/dashboard/QuickActions.jsx';
import { SummaryChart } from '../../components/dashboard/SummaryChart.jsx';
import { RecommendationCard } from '../../components/ai/RecommendationCard.jsx';
import { DollarSign, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export const DashboardPage = () => {
  return (
    <DashboardLayout title="Business Intelligence Overview">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(184500)}
          change="+14.2%"
          isPositive={true}
          icon={DollarSign}
          subtitle="vs $161,500 last mo"
        />
        <StatCard
          title="Net Profit Margin"
          value="66.2%"
          change="+3.8%"
          isPositive={true}
          icon={TrendingUp}
          subtitle="Gross profit $122.2k"
        />
        <StatCard
          title="Active Customers"
          value="1,420"
          change="+8.4%"
          isPositive={true}
          icon={Users}
          subtitle="Avg LTV $680"
        />
        <StatCard
          title="Target Pacing"
          value="123%"
          change="Exceeded"
          isPositive={true}
          icon={ShoppingBag}
          subtitle="Target $150,000"
        />
      </div>

      {/* Quick Actions Bar */}
      <QuickActions />

      {/* Charts & AI Recommendations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SummaryChart />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Top Gemini AI Recommendations
          </h3>
          <RecommendationCard
            title="Expand Enterprise Subscriptions"
            impact="+$22k / mo"
            confidence={94}
            description="High 78% profit margins on enterprise add-ons. Targeted outreach to active SaaS accounts yields immediate ACV expansion."
          />
          <RecommendationCard
            title="Optimize North America Ad Bids"
            impact="-$4.5k / mo"
            confidence={88}
            description="Reallocate $5,000 ad budget from high-CAC channels toward Asia Pacific campaigns to maximize return on ad spend."
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
