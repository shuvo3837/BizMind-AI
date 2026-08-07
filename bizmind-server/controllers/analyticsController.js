import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardAnalytics = async (req, res) => {
  const analyticsData = {
    overview: {
      totalRevenue: 184500,
      revenueGrowthPct: +14.2,
      totalExpenses: 62300,
      netProfit: 122200,
      grossMarginPct: 66.2,
      activeCustomers: 1420,
      monthlyTarget: 150000,
      targetProgressPct: 123
    },
    revenueTrend: [
      { month: 'Jan', revenue: 95000, expenses: 42000, profit: 53000 },
      { month: 'Feb', revenue: 110000, expenses: 45000, profit: 65000 },
      { month: 'Mar', revenue: 128000, expenses: 49000, profit: 79000 },
      { month: 'Apr', revenue: 142000, expenses: 53000, profit: 89000 },
      { month: 'May', revenue: 160000, expenses: 58000, profit: 102000 },
      { month: 'Jun', revenue: 175000, expenses: 60000, profit: 115000 },
      { month: 'Jul', revenue: 184500, expenses: 62300, profit: 122200 }
    ],
    salesByCategory: [
      { category: 'SaaS Subscriptions', value: 92000, fill: '#3b82f6' },
      { category: 'Physical Hardware', value: 48000, fill: '#10b981' },
      { category: 'Consulting Services', value: 28500, fill: '#f59e0b' },
      { category: 'Enterprise Add-ons', value: 16000, fill: '#8b5cf6' }
    ],
    inventoryHealth: [
      { product: 'Smart Hub Pro', stock: 142, reorderPoint: 30, status: 'Healthy' },
      { product: 'IoT Sensor Node', stock: 18, reorderPoint: 25, status: 'Low Stock' },
      { product: 'Wireless Gateway', stock: 88, reorderPoint: 20, status: 'Healthy' },
      { product: 'Industrial Power Unit', stock: 4, reorderPoint: 10, status: 'Critical' }
    ]
  };

  return sendSuccess(res, 'Dashboard analytics data loaded', analyticsData);
};

export const getDeepAnalytics = async (req, res) => {
  const deepAnalytics = {
    customerAcquisitionCost: 42.50,
    lifetimeValue: 680.00,
    churnRatePct: 1.8,
    averageBasketSize: 185.00,
    topPerformingRegions: [
      { region: 'North America', revenue: 98000 },
      { region: 'Western Europe', revenue: 52000 },
      { region: 'Asia Pacific', revenue: 34500 }
    ]
  };

  return sendSuccess(res, 'Deep analytics insights loaded', deepAnalytics);
};
