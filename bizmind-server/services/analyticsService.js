import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Upload from '../models/Upload.js';

const getMonthKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const calculateAnalytics = async (businessId) => {
  const safe = (arr) => Array.isArray(arr) ? arr : [];
  const [salesRaw, expensesRaw, productsRaw, inventoryRaw, uploadsRaw] = await Promise.all([
    Sale.find({ businessId }).lean().catch(() => []),
    Expense.find({ businessId }).lean().catch(() => []),
    Product.find({ businessId }).lean().catch(() => []),
    Inventory.find({ businessId }).lean().catch(() => []),
    Upload.find({ businessId }).lean().catch(() => []),
  ]);
  const sales = safe(salesRaw);
  const expenses = safe(expensesRaw);
  const products = safe(productsRaw);
  const inventory = safe(inventoryRaw);
  const uploads = safe(uploadsRaw);

  const totalRevenue = sales.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalCost = sales.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalSales = sales.length;
  const totalUnitsSold = sales.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalProducts = new Set(sales.filter((item) => item.productName).map((item) => item.productName)).size;
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitCost || 0)), 0);
  const profitMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0;
  const averageOrderValue = totalSales > 0 ? Number((totalRevenue / totalSales).toFixed(2)) : 0;

  const revenueByCategory = Object.values(sales.reduce((acc, sale) => {
    const category = sale.category || 'Uncategorized';
    acc[category] = acc[category] || { category, revenue: 0 };
    acc[category].revenue += sale.revenue || 0;
    return acc;
  }, {}));

  const expenseByCategory = Object.values(expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = acc[category] || { category, amount: 0 };
    acc[category].amount += expense.amount || 0;
    return acc;
  }, {})).map((item) => ({
    ...item,
    percentage: totalExpenses > 0 ? Number(((item.amount / totalExpenses) * 100).toFixed(2)) : 0
  }));

  const topProducts = Object.values(sales.reduce((acc, sale) => {
    const key = sale.productName || sale.productId || 'Unknown Product';
    if (!acc[key]) {
      acc[key] = { productName: key, category: sale.category || 'Uncategorized', unitsSold: 0, revenue: 0, profit: 0 };
    }
    acc[key].unitsSold += sale.quantity || 0;
    acc[key].revenue += sale.revenue || 0;
    acc[key].profit += (sale.revenue || 0) - (sale.cost || 0);
    return acc;
  }, {})).sort((a, b) => b.revenue - a.revenue);

  const revenueTrend = Object.entries(sales.reduce((acc, sale) => {
    const period = getMonthKey(sale.date || sale.createdAt);
    acc[period] = (acc[period] || 0) + (sale.revenue || 0);
    return acc;
  }, {})).map(([period, revenue]) => ({ period, revenue }));

  const profitTrend = Object.entries(sales.reduce((acc, sale) => {
    const period = getMonthKey(sale.date || sale.createdAt);
    const profit = (sale.revenue || 0) - (sale.cost || 0);
    acc[period] = (acc[period] || 0) + profit;
    return acc;
  }, {})).map(([period, profit]) => ({ period, profit }));

  const inventoryStatus = inventory.map((item) => ({
    productName: item.productName || 'Unnamed',
    sku: item.sku || '',
    category: item.category || 'Uncategorized',
    quantity: item.quantity || 0,
    reorderLevel: item.reorderLevel || null,
    inventoryValue: Number(((item.quantity || 0) * (item.unitCost || 0)).toFixed(2)),
    lowStock: item.reorderLevel != null ? (item.quantity || 0) <= item.reorderLevel : false
  }));

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    totalSales,
    totalUnitsSold,
    totalProducts,
    totalExpenses,
    totalInventoryValue,
    profitMargin,
    averageOrderValue,
    growthRate: 0,
    revenueByCategory,
    expenseByCategory,
    topProducts,
    revenueTrend,
    profitTrend,
    inventoryStatus,
    salesCount: sales.length,
    productCount: products.length,
    expenseCount: expenses.length,
    inventoryCount: inventory.length,
    uploadCount: uploads.length
  };
};
