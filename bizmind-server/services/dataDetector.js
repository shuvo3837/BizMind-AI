export const detectDataTypes = (rows) => {
  const detected = new Set();

  rows.forEach((row) => {
    if (!row || typeof row !== 'object') return;

    const hasProduct = row.productName || row.sku || row.category;
    const hasSalesRow = row.quantity != null || row.unitPrice != null || row.revenue != null;
    const hasInventoryRow = row.stock != null || row.currentStock != null || row.reorderLevel != null;
    const hasExpenseRow = row.amount != null && !row.revenue;

    if (hasProduct && hasSalesRow) {
      detected.add('sales');
      detected.add('products');
    }

    if (row.revenue != null) {
      detected.add('revenue');
    }

    if (row.cost != null) {
      detected.add('cost');
    }

    if (hasInventoryRow) {
      detected.add('inventory');
    }

    if (hasExpenseRow) {
      detected.add('expenses');
      detected.add('financial');
    }

    if (row.customer || row.customerName || row.customer_id) {
      detected.add('customers');
    }
  });

  if (detected.size === 0 && rows.length > 0) {
    detected.add('financial');
  }

  return Array.from(detected);
};
