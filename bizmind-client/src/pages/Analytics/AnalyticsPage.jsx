import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout.jsx';
import { SalesChart } from '../../components/charts/SalesChart.jsx';
import { ExpenseBreakdown } from '../../components/charts/ExpenseBreakdown.jsx';
import { RevenueTrend } from '../../components/charts/RevenueTrend.jsx';
import { InventoryBarChart } from '../../components/charts/InventoryBarChart.jsx';

export const AnalyticsPage = () => {
  return (
    <DashboardLayout title="Deep Financial Analytics & Visualizations">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <ExpenseBreakdown />
        <RevenueTrend />
        <InventoryBarChart />
      </div>
    </DashboardLayout>
  );
};
