import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Upload from '../models/Upload.js';

const safe = (arr) => (Array.isArray(arr) ? arr : []);
const round = (n, d = 2) => Number(Number(n || 0).toFixed(d));
const isoDate = (d) => {
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
};

// YYYY-MM-DD (date-only key, local time). Use this for daily trend buckets.
const getDayKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// YYYY-MM month key, for monthly aggregation when there are too many daily points.
const getMonthKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (ym) => {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return ym || '';
  const [y, m] = ym.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${y}`;
};

const dayLabel = (ymd) => {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || '';
  const [y, m, d] = ymd.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}, ${y}`;
};

/**
 * Build the canonical analytics payload for a single business + user.
 *
 * CRITICAL: filters every query by BOTH `userId` AND `businessId` so that
 * no analytics can leak across users even if they ever share a businessId
 * (legacy data, future team-seats, etc.). Records missing either field are
 * excluded — this is the safe default for a privacy-first system.
 *
 * Everything here is computed from MongoDB documents belonging to the user.
 * There are no hardcoded numbers, dummy percentages, or invented dates.
 */
export const calculateAnalytics = async (userId, businessId) => {
  if (!userId || !businessId) {
    return {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalSales: 0,
      totalUnitsSold: 0,
      totalProducts: 0,
      totalExpenses: 0,
      totalInventoryValue: 0,
      profitMargin: 0,
      averageOrderValue: 0,
      salesByCategory: [],
      expenseAllocation: [],
      topProducts: [],
      revenueTrend: [],
      revenueTrendGranularity: 'daily',
      inventoryVsReorder: [],
      lowStockItems: [],
      profitAnalysis: {
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        operatingExpenses: 0,
        netProfit: null,
        netProfitMargin: null,
        hasOperatingExpenseData: false,
      },
      dataQuality: {
        source: 'Uploaded Business Data',
        recordsAnalyzed: 0,
        salesRecords: 0,
        expenseRecords: 0,
        productRecords: 0,
        inventoryRecords: 0,
        dateRange: null,
        lastUpdated: null,
        lastUploadName: null,
      },
      insights: {},
      trendStats: null,
      counts: { sales: 0, expenses: 0, products: 0, inventory: 0, uploads: 0 },
    };
  }

  const ownerFilter = { userId, businessId };

  const [salesRaw, expensesRaw, productsRaw, inventoryRaw, uploadsRaw] = await Promise.all([
    Sale.find(ownerFilter).lean().catch(() => []),
    Expense.find(ownerFilter).lean().catch(() => []),
    Product.find(ownerFilter).lean().catch(() => []),
    Inventory.find(ownerFilter).sort({ createdAt: -1 }).lean().catch(() => []),
    Upload.find(ownerFilter).sort({ createdAt: -1 }).lean().catch(() => []),
  ]);
  const sales = safe(salesRaw);
  const expenses = safe(expensesRaw);
  const products = safe(productsRaw);
  const inventory = safe(inventoryRaw);
  const uploads = safe(uploadsRaw);

  // ──────────────── KPI CORE ────────────────
  const totalRevenue = round(sales.reduce((s, x) => s + (x.revenue || 0), 0));
  const totalCost = round(sales.reduce((s, x) => s + (x.cost || 0), 0));
  const grossProfit = round(totalRevenue - totalCost);
  const totalExpenses = round(expenses.reduce((s, x) => s + (x.amount || 0), 0));
  const totalUnitsSold = sales.reduce((s, x) => s + (x.quantity || 0), 0);
  const distinctProductNames = new Set(
    sales.filter((x) => x.productName).map((x) => x.productName)
  );
  const totalProducts = distinctProductNames.size;
  const totalSales = sales.length;
  const profitMargin = totalRevenue > 0 ? round((grossProfit / totalRevenue) * 100) : 0;
  const averageOrderValue = totalSales > 0 ? round(totalRevenue / totalSales) : 0;

  const hasOperatingExpenseData = expenses.length > 0;
  const netProfit = hasOperatingExpenseData ? round(grossProfit - totalExpenses) : null;
  const netProfitMargin =
    hasOperatingExpenseData && totalRevenue > 0 ? round((netProfit / totalRevenue) * 100) : null;

  // ──────────────── SALES BY CATEGORY ────────────────
  const categoryAgg = {};
  sales.forEach((s) => {
    const cat = (s.category || '').trim() || 'Uncategorized';
    if (!categoryAgg[cat]) categoryAgg[cat] = { category: cat, revenue: 0, units: 0, sales: 0 };
    categoryAgg[cat].revenue += s.revenue || 0;
    categoryAgg[cat].units += s.quantity || 0;
    categoryAgg[cat].sales += 1;
  });
  const salesByCategory = Object.values(categoryAgg)
    .map((c) => ({
      category: c.category,
      revenue: round(c.revenue),
      units: c.units,
      sales: c.sales,
      percentage: totalRevenue > 0 ? round((c.revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topCategory = salesByCategory[0] || null;

  // ──────────────── EXPENSE ALLOCATION ────────────────
  const expenseAgg = {};
  expenses.forEach((e) => {
    const cat = (e.category || '').trim() || 'Other';
    if (!expenseAgg[cat]) expenseAgg[cat] = { category: cat, amount: 0, count: 0 };
    expenseAgg[cat].amount += e.amount || 0;
    expenseAgg[cat].count += 1;
  });
  const expenseAllocation = Object.values(expenseAgg)
    .map((e) => ({
      category: e.category,
      amount: round(e.amount),
      count: e.count,
      percentage: totalExpenses > 0 ? round((e.amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  const topExpenseCategory = expenseAllocation[0] || null;

  // ──────────────── REVENUE TREND ────────────────
  // Daily buckets first; aggregate by month only if there are too many distinct days.
  const dayAgg = {};
  sales.forEach((s) => {
    const key = getDayKey(s.date || s.createdAt);
    if (!key) return;
    if (!dayAgg[key]) dayAgg[key] = { revenue: 0, profit: 0 };
    dayAgg[key].revenue += s.revenue || 0;
    dayAgg[key].profit += (s.revenue || 0) - (s.cost || 0);
  });
  const dailyEntries = Object.entries(dayAgg)
    .map(([period, v]) => ({ period, revenue: round(v.revenue), profit: round(v.profit) }))
    .sort((a, b) => (a.period < b.period ? -1 : a.period > b.period ? 1 : 0));

  let revenueTrendRaw = dailyEntries;
  let revenueTrendGranularity = 'daily';
  if (dailyEntries.length > 60) {
    // Too many days to read clearly; collapse to monthly.
    const monthAgg = {};
    dailyEntries.forEach(({ period, revenue, profit }) => {
      const m = period.slice(0, 7);
      if (!monthAgg[m]) monthAgg[m] = { revenue: 0, profit: 0 };
      monthAgg[m].revenue += revenue;
      monthAgg[m].profit += profit;
    });
    revenueTrendRaw = Object.entries(monthAgg)
      .map(([period, v]) => ({ period, revenue: round(v.revenue), profit: round(v.profit) }))
      .sort((a, b) => (a.period < b.period ? -1 : a.period > b.period ? 1 : 0));
    revenueTrendGranularity = 'monthly';
  }
  const revenueTrend = revenueTrendRaw.map((p) => ({
    period: p.period,
    label: revenueTrendGranularity === 'daily' ? dayLabel(p.period) : monthLabel(p.period),
    revenue: p.revenue,
    profit: p.profit,
  }));

  // Trend stats (only computed when there's more than one period).
  let trendStats = null;
  if (revenueTrend.length >= 2) {
    const first = revenueTrend[0].revenue;
    const last = revenueTrend[revenueTrend.length - 1].revenue;
    const values = revenueTrend.map((p) => p.revenue);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const maxEntry = revenueTrend.find((p) => p.revenue === max);
    const minEntry = revenueTrend.find((p) => p.revenue === min);
    const changeAbs = last - first;
    const changePct = first > 0 ? round((changeAbs / first) * 100) : null;
    const direction = changeAbs > 0 ? 'increasing' : changeAbs < 0 ? 'decreasing' : 'stable';
    trendStats = {
      direction,
      changeAbs: round(changeAbs),
      changePct,
      total: round(total),
      average: round(avg),
      highest: { period: maxEntry?.label || maxEntry?.period, revenue: round(max) },
      lowest: { period: minEntry?.label || minEntry?.period, revenue: round(min) },
    };
  } else if (revenueTrend.length === 1) {
    const only = revenueTrend[0];
    trendStats = {
      direction: 'stable',
      changeAbs: 0,
      changePct: null,
      total: only.revenue,
      average: only.revenue,
      highest: { period: only.label, revenue: only.revenue },
      lowest: { period: only.label, revenue: only.revenue },
    };
  }

  // ──────────────── INVENTORY VS REORDER ────────────────
  // Pick the latest record per productName (or sku fallback).
  const inventoryByProduct = {};
  inventory.forEach((item) => {
    const name = (item.productName || item.sku || '').trim();
    if (!name) return;
    if (inventoryByProduct[name]) return; // already newest because sort({createdAt:-1})
    inventoryByProduct[name] = item;
  });
  const inventoryVsReorder = Object.values(inventoryByProduct).map((item) => {
    const qty = item.quantity || 0;
    const reorder = item.reorderLevel != null ? item.reorderLevel : null;
    return {
      productName: item.productName || item.sku || 'Unknown',
      sku: item.sku || '',
      category: item.category || 'Uncategorized',
      stock: qty,
      reorderLevel: reorder,
      inventoryValue: round((qty || 0) * (item.unitCost || 0)),
      belowReorder: reorder != null ? qty < reorder : false,
    };
  });
  const lowStockItems = inventoryVsReorder.filter((i) => i.belowReorder);
  const inventoryCount = inventoryVsReorder.length;

  // ──────────────── TOP PRODUCTS ────────────────
  const productAgg = {};
  sales.forEach((s) => {
    const key = (s.productName || s.productId || '').trim();
    if (!key) return;
    if (!productAgg[key]) {
      productAgg[key] = {
        productName: key,
        category: s.category || 'Uncategorized',
        unitsSold: 0,
        revenue: 0,
        profit: 0,
      };
    }
    productAgg[key].unitsSold += s.quantity || 0;
    productAgg[key].revenue += s.revenue || 0;
    productAgg[key].profit += (s.revenue || 0) - (s.cost || 0);
  });
  const topProducts = Object.values(productAgg)
    .map((p) => ({
      productName: p.productName,
      category: p.category,
      unitsSold: p.unitsSold,
      revenue: round(p.revenue),
      profit: round(p.profit),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ──────────────── DATA QUALITY ────────────────
  // Date range is taken from sales (the primary business fact). If there are no
  // sales, fall back to expenses / inventory / uploads to still show *something*.
  const allDates = [];
  sales.forEach((s) => { const d = isoDate(s.date || s.createdAt); if (d) allDates.push(d); });
  expenses.forEach((e) => { const d = isoDate(e.date || e.createdAt); if (d) allDates.push(d); });
  inventory.forEach((i) => { const d = isoDate(i.date || i.createdAt); if (d) allDates.push(d); });
  let dateRange = null;
  if (allDates.length > 0) {
    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
    dateRange = {
      start: min.toISOString().slice(0, 10),
      end: max.toISOString().slice(0, 10),
    };
  }
  const lastUpload = uploads[0] || null;
  const dataQuality = {
    source: 'Uploaded Business Data',
    recordsAnalyzed: sales.length + expenses.length + products.length + inventoryVsReorder.length,
    salesRecords: sales.length,
    expenseRecords: expenses.length,
    productRecords: products.length,
    inventoryRecords: inventoryVsReorder.length,
    dateRange,
    lastUpdated: lastUpload ? lastUpload.createdAt : null,
    lastUploadName: lastUpload ? lastUpload.originalName : null,
  };

  // ──────────────── INSIGHTS ────────────────
  const insights = {};
  if (topCategory) {
    insights.salesByCategory = `${topCategory.category} generated the highest revenue, contributing ${totalRevenue > 0 ? round((topCategory.revenue / totalRevenue) * 100) : 0}% of total revenue.`;
  }
  if (topExpenseCategory) {
    insights.expenseAllocation = `${topExpenseCategory.category} is the largest operating expense at $${topExpenseCategory.amount.toLocaleString()}.`;
  }
  if (trendStats && trendStats.highest.period) {
    insights.revenueTrend = `Revenue reached its highest level on ${trendStats.highest.period} with $${trendStats.highest.revenue.toLocaleString()}.`;
  }
  if (inventoryVsReorder.length > 0) {
    const below = lowStockItems.length;
    if (below > 0) {
      const names = lowStockItems.slice(0, 5).map((i) => i.productName).join(', ');
      insights.inventory = `${below} ${below === 1 ? 'product is' : 'products are'} currently below ${below === 1 ? 'its' : 'their'} reorder level (${names}).`;
    } else {
      insights.inventory = `All ${inventoryVsReorder.length} products are at or above their reorder levels.`;
    }
  }

  // ──────────────── PROFIT ANALYSIS ────────────────
  const profitAnalysis = {
    revenue: totalRevenue,
    cogs: totalCost,
    grossProfit,
    operatingExpenses: totalExpenses,
    netProfit,
    netProfitMargin,
    hasOperatingExpenseData,
  };

  // ──────────────── RETURN ────────────────
  return {
    // KPIs
    totalRevenue,
    totalCost,
    totalProfit: grossProfit,
    totalSales,
    totalUnitsSold,
    totalProducts,
    totalExpenses,
    totalInventoryValue: round(
      inventoryVsReorder.reduce((s, i) => s + (i.inventoryValue || 0), 0)
    ),
    profitMargin,
    averageOrderValue,

    // Charts
    salesByCategory,
    expenseAllocation,
    topProducts,
    revenueTrend,
    revenueTrendGranularity,
    inventoryVsReorder,
    lowStockItems,

    // Profit
    profitAnalysis,

    // Data quality
    dataQuality,
    insights,
    trendStats,

    // Counts (for empty-state UI)
    counts: {
      sales: sales.length,
      expenses: expenses.length,
      products: products.length,
      inventory: inventoryVsReorder.length,
      uploads: uploads.length,
    },
  };
};
