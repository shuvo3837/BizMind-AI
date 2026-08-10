import Report from '../models/Report.js';
import { calculateAnalytics } from '../services/analyticsService.js';
import { generateAiResponse, isAiConfigured } from '../services/aiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

const PERIOD_PRESETS = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export const generateReport = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const period = (req.body.period || 'monthly').toLowerCase();
  const days = PERIOD_PRESETS[period] || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const analytics = await calculateAnalytics(businessId);

  const hasData =
    (analytics.totalSales || 0) + (analytics.totalProducts || 0) + (analytics.totalExpenses || 0) > 0 ||
    (Array.isArray(analytics.inventoryStatus) ? analytics.inventoryStatus.length : (analytics.inventoryCount || 0)) > 0;

  if (!hasData) {
    return fail(res, 'Cannot generate a report — no business data available. Upload data first.', 400);
  }

  let aiInsights = null;
  if (isAiConfigured()) {
    const ai = await generateAiResponse(
      {
        period,
        dateRange: { from: startDate, to: new Date() },
        analytics: {
          revenue: analytics.totalRevenue,
          profit: analytics.totalProfit,
          expenses: analytics.totalExpenses,
          sales: analytics.totalSales,
          topProducts: analytics.topProducts,
          revenueByCategory: analytics.revenueByCategory,
          expenseByCategory: analytics.expenseByCategory,
        },
      },
      `Generate a concise executive ${period} business report based ONLY on the data above.`
    );
    if (ai.ok) aiInsights = ai.text;
  }

  const report = await Report.create({
    businessId,
    userId: req.user._id,
    title: req.body.title || `${period.charAt(0).toUpperCase() + period.slice(1)} Business Report`,
    period,
    startDate,
    endDate: new Date(),
    summary: {
      totalRevenue: analytics.totalRevenue,
      totalProfit: analytics.totalProfit,
      totalExpenses: analytics.totalExpenses,
      totalSales: analytics.totalSales,
      profitMargin: analytics.profitMargin,
      topProducts: analytics.topProducts?.slice(0, 5) || [],
      revenueByCategory: analytics.revenueByCategory || [],
      expenseByCategory: analytics.expenseByCategory || [],
    },
    aiInsights: aiInsights || 'AI insights were not generated (no provider configured or empty dataset).',
    status: 'completed',
  });

  return ok(res, 'Report generated successfully.', report);
});

export const getReportsList = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const reports = await Report.find({ businessId }).sort({ createdAt: -1 }).lean();
  return ok(res, 'Reports retrieved.', reports);
});

export const getReportById = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const report = await Report.findOne({ _id: req.params.id, businessId }).lean();
  if (!report) return fail(res, 'Report not found.', 404);
  return ok(res, 'Report retrieved.', report);
});

export const deleteReport = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const report = await Report.findOne({ _id: req.params.id, businessId });
  if (!report) return fail(res, 'Report not found.', 404);
  await report.deleteOne();
  return ok(res, 'Report deleted.', { id: req.params.id });
});

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/"/g, '""');
  return /[",\n\r]/.test(str) ? `"${str}"` : str;
};

const toCsv = (report) => {
  const lines = [];
  lines.push(`# ${report.title || 'Business Report'}`);
  lines.push(`# Period,${report.period || 'monthly'}`);
  lines.push(`# Generated,${report.createdAt}`);
  lines.push('');
  lines.push('Section,Metric,Value');
  lines.push(`Summary,Total Revenue,${report.summary?.totalRevenue ?? 0}`);
  lines.push(`Summary,Total Profit,${report.summary?.totalProfit ?? 0}`);
  lines.push(`Summary,Total Expenses,${report.summary?.totalExpenses ?? 0}`);
  lines.push(`Summary,Total Sales,${report.summary?.totalSales ?? 0}`);
  lines.push(`Summary,Profit Margin,${report.summary?.profitMargin ?? 0}%`);

  const tops = Array.isArray(report.summary?.topProducts) ? report.summary.topProducts : [];
  tops.forEach((p, i) => {
    lines.push(`Top Product ${i + 1},${escapeCsv(p.productName || p.name || 'N/A')},${p.revenue ?? p.totalRevenue ?? 0}`);
  });

  const revByCat = Array.isArray(report.summary?.revenueByCategory) ? report.summary.revenueByCategory : [];
  revByCat.forEach((c, i) => {
    lines.push(`Revenue Category ${i + 1},${escapeCsv(c.category || c.name || 'N/A')},${c.revenue ?? c.total ?? 0}`);
  });

  const expByCat = Array.isArray(report.summary?.expenseByCategory) ? report.summary.expenseByCategory : [];
  expByCat.forEach((c, i) => {
    lines.push(`Expense Category ${i + 1},${escapeCsv(c.category || c.name || 'N/A')},${c.amount ?? c.total ?? 0}`);
  });

  return lines.join('\n');
};

const toHtml = (report) => {
  const rows = (label, value) => `<tr><td><strong>${escapeCsv(label)}</strong></td><td>${escapeCsv(value)}</td></tr>`;
  const renderList = (title, items, nameKey, valueKey) => `
    <h3>${escapeCsv(title)}</h3>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Name</th><th>Value</th></tr></thead>
      <tbody>
        ${(items || [])
          .map((it) => `<tr><td>${escapeCsv(it[nameKey] || it.category || it.productName || 'N/A')}</td><td>${escapeCsv(it[valueKey] ?? it.revenue ?? it.amount ?? 0)}</td></tr>`)
          .join('')}
      </tbody>
    </table>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeCsv(report.title || 'Business Report')}</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 32px; color: #0f172a; }
    h1 { color: #4f46e5; }
    table { border-collapse: collapse; margin: 12px 0; width: 100%; }
    th { background: #f1f5f9; text-align: left; }
    .meta { color: #64748b; font-size: 13px; }
    .insights { background: #eef2ff; padding: 16px; border-radius: 8px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${escapeCsv(report.title || 'Business Report')}</h1>
  <p class="meta">Period: ${escapeCsv(report.period || 'monthly')} • Generated: ${escapeCsv(report.createdAt)}</p>

  <h2>Executive Summary</h2>
  <table border="1" cellpadding="6" cellspacing="0">
    <tbody>
      ${rows('Total Revenue', report.summary?.totalRevenue ?? 0)}
      ${rows('Total Profit', report.summary?.totalProfit ?? 0)}
      ${rows('Total Expenses', report.summary?.totalExpenses ?? 0)}
      ${rows('Total Sales', report.summary?.totalSales ?? 0)}
      ${rows('Profit Margin', `${report.summary?.profitMargin ?? 0}%`)}
    </tbody>
  </table>

  ${renderList('Top Products', report.summary?.topProducts, 'productName', 'revenue')}
  ${renderList('Revenue by Category', report.summary?.revenueByCategory, 'category', 'revenue')}
  ${renderList('Expense by Category', report.summary?.expenseByCategory, 'category', 'amount')}

  <h2>AI Insights</h2>
  <div class="insights">${escapeCsv(report.aiInsights || 'No insights available.')}</div>
</body>
</html>`;
};

export const downloadReport = asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const format = (req.query.format || 'json').toLowerCase();
  const report = await Report.findOne({ _id: req.params.id, businessId }).lean();
  if (!report) return fail(res, 'Report not found.', 404);

  const safeTitle = (report.title || 'report').replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60);

  if (format === 'csv') {
    const csv = toCsv(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.csv"`);
    return res.send(csv);
  }

  if (format === 'html') {
    const html = toHtml(report);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.html"`);
    return res.send(html);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.json"`);
  return res.send(JSON.stringify(report, null, 2));
});
