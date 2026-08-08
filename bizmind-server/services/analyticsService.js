import Sale from '../models/Sale.js';

// In-memory sync store for when MongoDB is connecting or operating in dev mode
export let inMemorySales = [];

export const setInMemorySales = (sales) => {
  inMemorySales = sales;
};

export const addInMemorySales = (newSales) => {
  inMemorySales = [...newSales, ...inMemorySales];
};

export const deleteInMemorySalesByUploadId = (uploadId) => {
  inMemorySales = inMemorySales.filter(s => s.uploadId !== uploadId);
};

export const clearInMemorySales = () => {
  inMemorySales = [];
};

// Helper to filter sales by period
const filterSalesByPeriod = (salesList, period = 'all') => {
  if (!period || period === 'all') return salesList;

  const now = new Date();
  let cutoff = new Date();

  if (period === '7d') cutoff.setDate(now.getDate() - 7);
  else if (period === '30d') cutoff.setDate(now.getDate() - 30);
  else if (period === '90d') cutoff.setDate(now.getDate() - 90);
  else return salesList;

  return salesList.filter(s => new Date(s.date || s.createdAt) >= cutoff);
};

// Main function to fetch sales records from MongoDB (or fallback memory)
export const getRawSalesData = async (businessId = 'dev-business-001', period = 'all') => {
  let dbSales = [];
  try {
    dbSales = await Sale.find({ businessId }).sort({ date: -1 }).lean();
  } catch (err) {
    console.warn('MongoDB sales fetch warning:', err.message);
  }

  const filteredInMemory = inMemorySales.filter(s => !s.businessId || s.businessId === businessId);

  // Combine DB sales and in-memory sales without duplicates
  const combinedMap = new Map();
  [...dbSales, ...filteredInMemory].forEach(item => {
    const key = item._id ? item._id.toString() : item.id;
    if (key && !combinedMap.has(key)) {
      combinedMap.set(key, item);
    }
  });

  const allSales = Array.from(combinedMap.values());
  return filterSalesByPeriod(allSales, period);
};

export const getAnalyticsSummary = async (businessId = 'dev-business-001', period = 'all') => {
  const sales = await getRawSalesData(businessId, period);

  if (!sales || sales.length === 0) {
    return {
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
      growthStatus: 'Insufficient historical data',
      period
    };
  }

  let totalRevenue = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let totalUnitsSold = 0;
  const uniqueProducts = new Set();

  sales.forEach(s => {
    const rev = Number(s.revenue) || (Number(s.quantity || 1) * Number(s.unitPrice || 0)) || 0;
    const cst = Number(s.cost) || 0;
    const prf = (s.profit !== undefined && s.profit !== null) ? Number(s.profit) : (rev - cst);
    const qty = Number(s.quantity) || 1;

    totalRevenue += rev;
    totalCost += cst;
    totalProfit += prf;
    totalUnitsSold += qty;

    if (s.productName) uniqueProducts.add(s.productName.trim());
  });

  const totalSales = sales.length;
  const totalProducts = uniqueProducts.size;
  const profitMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0;
  const averageOrderValue = totalSales > 0 ? Number((totalRevenue / totalSales).toFixed(2)) : 0;

  // Simple growth rate calculation if sufficient sales span multiple periods
  let growthRate = 0;
  let growthStatus = 'Normal';

  if (sales.length >= 4) {
    const half = Math.floor(sales.length / 2);
    const recentSales = sales.slice(0, half);
    const olderSales = sales.slice(half);

    const recentRev = recentSales.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
    const olderRev = olderSales.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);

    if (olderRev > 0) {
      growthRate = Number((((recentRev - olderRev) / olderRev) * 100).toFixed(1));
    } else {
      growthRate = 0;
      growthStatus = 'Insufficient historical baseline';
    }
  } else {
    growthRate = 0;
    growthStatus = 'Insufficient historical data';
  }

  return {
    hasData: true,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    totalSales,
    totalUnitsSold,
    totalProducts,
    profitMargin,
    averageOrderValue,
    growthRate,
    growthStatus,
    period
  };
};

export const getRevenueTrend = async (businessId = 'dev-business-001', period = 'all') => {
  const sales = await getRawSalesData(businessId, period);

  if (!sales || sales.length === 0) return [];

  // Group by Month or Date
  const groupMap = {};

  sales.forEach(s => {
    const dateObj = s.date ? new Date(s.date) : new Date(s.createdAt || Date.now());
    const monthKey = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });

    if (!groupMap[monthKey]) {
      groupMap[monthKey] = {
        month: monthKey,
        rawDate: dateObj.getTime(),
        revenue: 0,
        cost: 0,
        expenses: 0,
        profit: 0,
        salesCount: 0
      };
    }

    const rev = Number(s.revenue) || 0;
    const cst = Number(s.cost) || 0;
    const prf = s.profit !== undefined ? Number(s.profit) : (rev - cst);

    groupMap[monthKey].revenue += rev;
    groupMap[monthKey].cost += cst;
    groupMap[monthKey].expenses += cst;
    groupMap[monthKey].profit += prf;
    groupMap[monthKey].salesCount += 1;
  });

  const result = Object.values(groupMap).sort((a, b) => a.rawDate - b.rawDate);
  return result.map(item => ({
    month: item.month,
    revenue: Number(item.revenue.toFixed(2)),
    cost: Number(item.cost.toFixed(2)),
    expenses: Number(item.expenses.toFixed(2)),
    profit: Number(item.profit.toFixed(2)),
    salesCount: item.salesCount
  }));
};

export const getCategoryPerformance = async (businessId = 'dev-business-001', period = 'all') => {
  const sales = await getRawSalesData(businessId, period);

  if (!sales || sales.length === 0) return [];

  const categoryMap = {};

  sales.forEach(s => {
    const cat = s.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, name: cat, value: 0, revenue: 0, cost: 0, profit: 0, units: 0 };
    }

    const rev = Number(s.revenue) || 0;
    const cst = Number(s.cost) || 0;
    const prf = s.profit !== undefined ? Number(s.profit) : (rev - cst);

    categoryMap[cat].value += rev;
    categoryMap[cat].revenue += rev;
    categoryMap[cat].cost += cst;
    categoryMap[cat].profit += prf;
    categoryMap[cat].units += (Number(s.quantity) || 1);
  });

  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  return Object.values(categoryMap).map((item, idx) => ({
    ...item,
    amount: Number(item.revenue.toFixed(2)),
    value: Number(item.revenue.toFixed(2)),
    profit: Number(item.profit.toFixed(2)),
    fill: colors[idx % colors.length],
    color: colors[idx % colors.length]
  })).sort((a, b) => b.revenue - a.revenue);
};

export const getTopProducts = async (businessId = 'dev-business-001', period = 'all', limit = 5) => {
  const sales = await getRawSalesData(businessId, period);

  if (!sales || sales.length === 0) return [];

  const productMap = {};

  sales.forEach(s => {
    const prod = s.productName || 'Unspecified Item';
    if (!productMap[prod]) {
      productMap[prod] = {
        productName: prod,
        category: s.category || 'General',
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalUnits: 0,
        salesCount: 0
      };
    }

    const rev = Number(s.revenue) || 0;
    const cst = Number(s.cost) || 0;
    const prf = s.profit !== undefined ? Number(s.profit) : (rev - cst);

    productMap[prod].totalRevenue += rev;
    productMap[prod].totalCost += cst;
    productMap[prod].totalProfit += prf;
    productMap[prod].totalUnits += (Number(s.quantity) || 1);
    productMap[prod].salesCount += 1;
  });

  return Object.values(productMap)
    .map(p => ({
      ...p,
      totalRevenue: Number(p.totalRevenue.toFixed(2)),
      totalProfit: Number(p.totalProfit.toFixed(2))
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
};

export const getInventoryAnalytics = async (businessId = 'dev-business-001') => {
  const sales = await getRawSalesData(businessId, 'all');

  if (!sales || sales.length === 0) return [];

  const inventoryMap = {};

  sales.forEach(s => {
    const prod = s.productName || 'Item';
    if (!inventoryMap[prod]) {
      inventoryMap[prod] = {
        product: prod,
        stock: s.stockAfterSale || Math.max(10, 100 - (s.quantity || 1)),
        unitsSold: 0,
        reorderPoint: 20,
        status: 'Healthy'
      };
    }
    inventoryMap[prod].unitsSold += (Number(s.quantity) || 1);
  });

  return Object.values(inventoryMap).map(item => {
    const remainingStock = Math.max(0, item.stock);
    let status = 'Healthy';
    if (remainingStock === 0) status = 'Out of Stock';
    else if (remainingStock <= item.reorderPoint) status = 'Low Stock';

    return {
      product: item.product,
      stock: remainingStock,
      unitsSold: item.unitsSold,
      reorderPoint: item.reorderPoint,
      status
    };
  });
};

export const getCalculatedInsights = async (businessId = 'dev-business-001', period = 'all') => {
  const summary = await getAnalyticsSummary(businessId, period);

  if (!summary.hasData) {
    return [
      {
        id: 'ins_empty',
        title: 'No Business Data Available',
        type: 'warning',
        impact: 'Action Required',
        confidence: 100,
        description: 'Upload your business CSV, Excel, or PDF reports in the Upload Center to generate real AI strategic insights.',
        actionText: 'Go to Upload Center'
      }
    ];
  }

  const topProds = await getTopProducts(businessId, period, 1);
  const categories = await getCategoryPerformance(businessId, period);

  const insights = [];

  if (topProds && topProds.length > 0) {
    const topP = topProds[0];
    insights.push({
      id: 'ins_top_product',
      title: `Top Revenue Driver: ${topP.productName}`,
      type: 'success',
      impact: 'High Revenue Contribution',
      confidence: 98,
      description: `'${topP.productName}' generated $${topP.totalRevenue.toLocaleString()} in total revenue across ${topP.totalUnits} units sold.`,
      actionText: 'Optimize Product Strategy'
    });
  }

  if (categories && categories.length > 0) {
    const topC = categories[0];
    insights.push({
      id: 'ins_category',
      title: `Strongest Category: ${topC.category}`,
      type: 'success',
      impact: 'Category Dominance',
      confidence: 95,
      description: `Category '${topC.category}' generated $${topC.revenue.toLocaleString()} (${((topC.revenue / summary.totalRevenue) * 100).toFixed(1)}% of total business revenue).`,
      actionText: 'View Category Report'
    });
  }

  insights.push({
    id: 'ins_margin',
    title: `Profitability Margin: ${summary.profitMargin}%`,
    type: summary.profitMargin > 20 ? 'success' : 'warning',
    impact: 'Operating Efficiency',
    confidence: 99,
    description: `Total revenue is $${summary.totalRevenue.toLocaleString()} against total expenses of $${summary.totalCost.toLocaleString()}, yielding $${summary.totalProfit.toLocaleString()} net profit.`,
    actionText: 'Review Operating Costs'
  });

  return insights;
};

export default {
  getRawSalesData,
  getAnalyticsSummary,
  getRevenueTrend,
  getCategoryPerformance,
  getTopProducts,
  getInventoryAnalytics,
  getCalculatedInsights
};
