import Report from '../models/Report.js';
import { calculateAnalytics } from './analyticsService.js';

export const generateReportFromBusiness = async (businessId, userId, options = {}) => {
  const analytics = await calculateAnalytics(businessId);
  const title = options.title || `Business Performance Report ${new Date().toISOString().slice(0, 10)}`;
  const report = await Report.create({
    businessId,
    userId,
    title,
    reportType: options.reportType || 'Financial Performance',
    summary: `Business report for ${title}. Metrics are based on ${analytics.totalSales} sales records and ${analytics.totalExpenses} expense entries.`,
    sections: [
      {
        heading: 'Executive Summary',
        content: `Total revenue is ${analytics.totalRevenue}. Total profit is ${analytics.totalProfit}.`,
        keyTakeaways: [
          `Total Revenue: ${analytics.totalRevenue}`,
          `Total Profit: ${analytics.totalProfit}`,
          `Top Product by Revenue: ${analytics.topProducts?.[0]?.productName || 'N/A'}`
        ]
      },
      {
        heading: 'Recommendations',
        content: 'Focus on top performing categories and re-evaluate inventory reorder levels for low-stock products.',
        keyTakeaways: analytics.topProducts.slice(0, 3).map((product) => `Increase promotion for ${product.productName} with revenue ${product.revenue}`)
      }
    ],
    downloadUrl: '',
    status: 'completed'
  });

  return { report, analytics };
};
