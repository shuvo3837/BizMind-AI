import fs from 'fs';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Expense from '../models/Expense.js';
import Inventory from '../models/Inventory.js';
import { addInMemorySales } from './analyticsService.js';

export const parseFileContentToSales = async (filePath, uploadId, businessId = 'dev-business-001') => {
  const salesToInsert = [];
  const detectedTypesSet = new Set();

  try {
    if (filePath && fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const text = fileBuffer.toString('utf8');

      // Attempt line-by-line CSV / TSV parsing
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length > 1) {
        let sep = ',';
        const headerLine = lines[0];
        if (headerLine.includes('\t')) sep = '\t';
        else if (headerLine.includes(';')) sep = ';';

        const headers = headerLine.split(sep).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

        let nameIdx = headers.findIndex(h => /product|item|title|name|description|sku/i.test(h));
        let revIdx = headers.findIndex(h => /revenue|sales_amount|total_sales|income|total|amount|price_total|subtotal/i.test(h));
        let qtyIdx = headers.findIndex(h => /quantity|qty|units|units_sold|sold_quantity|count|volume/i.test(h));
        let costIdx = headers.findIndex(h => /purchase_cost|cogs|expense|cost_price|cost|unit_cost/i.test(h));
        let stockIdx = headers.findIndex(h => /stock_after_sale|stock_quantity|remaining_stock|current_stock|inventory|stock/i.test(h));
        let catIdx = headers.findIndex(h => /product_category|category|type|cat|group|department/i.test(h));
        let dateIdx = headers.findIndex(h => /sale_date|transaction_date|order_date|date|time|created_at/i.test(h));
        let priceIdx = headers.findIndex(h => /unit_price|unitprice|price_per_unit|rate|price/i.test(h));

        if (nameIdx !== -1) detectedTypesSet.add('products');
        if (revIdx !== -1 || priceIdx !== -1) detectedTypesSet.add('revenue');
        if (qtyIdx !== -1 || revIdx !== -1) detectedTypesSet.add('sales');
        if (costIdx !== -1) detectedTypesSet.add('expenses');
        if (stockIdx !== -1) detectedTypesSet.add('inventory');
        if (catIdx !== -1) detectedTypesSet.add('categories');

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(sep).map(r => r.trim().replace(/['"]/g, ''));
          if (row.length < 2) continue;

          const productName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : (row[0] || `Item #${i}`);
          const rawRev = revIdx !== -1 ? parseFloat(row[revIdx].replace(/[^0-9.-]+/g, '')) : NaN;
          const rawQty = qtyIdx !== -1 ? parseFloat(row[qtyIdx].replace(/[^0-9.-]+/g, '')) : NaN;
          const rawCost = costIdx !== -1 ? parseFloat(row[costIdx].replace(/[^0-9.-]+/g, '')) : NaN;
          const rawPrice = priceIdx !== -1 ? parseFloat(row[priceIdx].replace(/[^0-9.-]+/g, '')) : NaN;
          const rawStock = stockIdx !== -1 ? parseFloat(row[stockIdx].replace(/[^0-9.-]+/g, '')) : NaN;
          const category = catIdx !== -1 && row[catIdx] ? row[catIdx] : 'General';
          const dateStr = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString();

          const quantity = !isNaN(rawQty) && rawQty > 0 ? rawQty : 1;
          const unitPrice = !isNaN(rawPrice) && rawPrice >= 0 ? rawPrice : (!isNaN(rawRev) && rawRev >= 0 ? rawRev / quantity : 0);
          const revenue = !isNaN(rawRev) ? rawRev : (quantity * unitPrice);
          const cost = !isNaN(rawCost) ? rawCost : 0;
          const profit = Number((revenue - cost).toFixed(2));
          const stockAfterSale = !isNaN(rawStock) ? rawStock : 0;

          if (revenue > 0 || productName) {
            salesToInsert.push({
              businessId,
              uploadId: uploadId ? uploadId.toString() : '',
              productName,
              category,
              quantity,
              unitPrice: Number(unitPrice.toFixed(2)),
              revenue: Number(revenue.toFixed(2)),
              cost: Number(cost.toFixed(2)),
              profit,
              stockAfterSale,
              date: isNaN(new Date(dateStr).getTime()) ? new Date() : new Date(dateStr)
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Error parsing file content into sales:', err.message);
  }

  // If data was extracted, make sure default types are set
  if (salesToInsert.length > 0) {
    if (!detectedTypesSet.has('sales')) detectedTypesSet.add('sales');
    if (!detectedTypesSet.has('revenue')) detectedTypesSet.add('revenue');
    if (!detectedTypesSet.has('products')) detectedTypesSet.add('products');
  }

  let inserted = [];
  if (salesToInsert.length > 0) {
    try {
      inserted = await Sale.insertMany(salesToInsert);

      // Also create/update associated Product, Expense, and Inventory records
      const productSummaryMap = {};
      const expenseDocs = [];
      const inventoryDocs = [];

      salesToInsert.forEach(s => {
        if (!productSummaryMap[s.productName]) {
          productSummaryMap[s.productName] = {
            businessId,
            uploadId: uploadId ? uploadId.toString() : '',
            name: s.productName,
            category: s.category || 'General',
            sellingPrice: s.unitPrice,
            costPrice: s.quantity > 0 ? Number((s.cost / s.quantity).toFixed(2)) : s.cost,
            stockQuantity: s.stockAfterSale || 0,
            totalUnitsSold: 0,
            totalRevenue: 0
          };
        }
        productSummaryMap[s.productName].totalUnitsSold += s.quantity;
        productSummaryMap[s.productName].totalRevenue += s.revenue;

        if (s.cost > 0) {
          expenseDocs.push({
            businessId,
            uploadId: uploadId ? uploadId.toString() : '',
            date: s.date,
            category: s.category || 'Cost of Goods',
            description: `COGS: ${s.productName} (${s.quantity} units)`,
            amount: s.cost
          });
        }

        if (s.stockAfterSale > 0) {
          inventoryDocs.push({
            businessId,
            uploadId: uploadId ? uploadId.toString() : '',
            productName: s.productName,
            category: s.category || 'General',
            currentStock: s.stockAfterSale,
            unitCost: s.quantity > 0 ? Number((s.cost / s.quantity).toFixed(2)) : 0,
            status: s.stockAfterSale > 10 ? 'Healthy' : 'Low Stock'
          });
        }
      });

      const productDocs = Object.values(productSummaryMap);
      if (productDocs.length > 0) {
        await Product.insertMany(productDocs).catch(e => console.warn('Product insert warning:', e.message));
      }
      if (expenseDocs.length > 0) {
        await Expense.insertMany(expenseDocs).catch(e => console.warn('Expense insert warning:', e.message));
      }
      if (inventoryDocs.length > 0) {
        await Inventory.insertMany(inventoryDocs).catch(e => console.warn('Inventory insert warning:', e.message));
      }
    } catch (err) {
      console.warn('Sale.insertMany fallback to memory:', err.message);
      inserted = salesToInsert;
    }
    addInMemorySales(inserted);
  }

  return {
    sales: salesToInsert,
    detectedDataTypes: Array.from(detectedTypesSet)
  };
};

export const processUploadedFile = async (fileType, filePath, originalName, uploadId, businessId = 'dev-business-001') => {
  const { sales, detectedDataTypes } = await parseFileContentToSales(filePath, uploadId, businessId);

  const totalRev = sales.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const totalCost = sales.reduce((sum, s) => sum + (s.cost || 0), 0);

  const summaryMessage = sales.length > 0
    ? `File '${originalName}' successfully processed. Parsed ${sales.length} record(s) totaling $${totalRev.toLocaleString()} in revenue.`
    : `File '${originalName}' uploaded. No tabular transaction records detected.`;

  return {
    type: fileType || 'Document',
    status: 'Completed',
    summary: summaryMessage,
    extractedFields: ['productName', 'category', 'quantity', 'revenue', 'cost', 'profit', 'stockAfterSale', 'date'],
    detectedDataTypes: detectedDataTypes.length > 0 ? detectedDataTypes : ['Business Data'],
    recordsExtracted: sales.length,
    revenueTotal: totalRev,
    costTotal: totalCost,
    processedAt: new Date().toISOString()
  };
};

export default {
  parseFileContentToSales,
  processUploadedFile
};
