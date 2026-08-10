const canonicalFieldMap = {
  date: ['date', 'sale_date', 'transaction_date', 'created_at', 'created at', 'sale date', 'transaction date'],
  productName: ['product', 'product_name', 'product name', 'productName', 'item', 'item_name', 'item name', 'name', 'product title'],
  category: ['category', 'product_category', 'product category', 'type', 'segment'],
  quantity: ['quantity', 'qty', 'units', 'units_sold', 'quantity_sold', 'sold_units'],
  unitPrice: ['unit_price', 'unit price', 'price', 'selling_price', 'selling price', 'sale_price', 'sale price', 'amount'],
  revenue: ['revenue', 'sales', 'total_sales', 'total sales', 'gross_revenue', 'gross revenue', 'total_revenue', 'total revenue', 'amount'],
  cost: ['cost', 'cost_price', 'cost price', 'purchase_cost', 'purchase cost', 'expense', 'expense_amount', 'expense amount'],
  stock: ['stock', 'inventory', 'quantity_in_stock', 'quantity in stock', 'current_stock', 'current stock', 'available_stock', 'available stock', 'on_hand'],
  description: ['description', 'details', 'expense_description', 'expense description', 'item_description', 'item description', 'notes'],
  amount: ['amount', 'expense', 'expense_amount', 'expense amount', 'total_amount', 'total amount'],
  sku: ['sku', 'product_sku', 'product sku', 'item_sku', 'item sku'],
  reorderLevel: ['reorder_level', 'reorder level', 'reorder_point', 'reorder point']
};

const normalizeKey = (key) => {
  return key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

const findCanonicalKey = (rawKey) => {
  const normalizedKey = normalizeKey(rawKey);
  for (const canonical of Object.keys(canonicalFieldMap)) {
    if (canonicalFieldMap[canonical].some((alias) => normalizeKey(alias) === normalizedKey)) {
      return canonical;
    }
  }
  return null;
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number(value);
  }

  const text = value.toString().trim();
  if (text === '') {
    return null;
  }

  const numericText = text
    .replace(/[^0-9.\-]/g, '')
    .replace(/\.(?=.*\.)/g, '');

  const parsed = Number(numericText);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  const normalized = value.toString().trim().replace(/[-.]/g, '/');
  const fallbackDate = new Date(normalized);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

const normalizeValue = (key, value, currentRow) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (['quantity', 'unitPrice', 'revenue', 'cost', 'stock', 'amount', 'reorderLevel'].includes(key)) {
    return parseNumber(value);
  }

  if (key === 'date') {
    return parseDate(value);
  }

  return value.toString().trim();
};

export const normalizeRow = (rawRow) => {
  const normalized = {};
  Object.entries(rawRow || {}).forEach(([key, value]) => {
    const canonicalKey = findCanonicalKey(key);
    if (!canonicalKey) {
      return;
    }
    const normalizedValue = normalizeValue(canonicalKey, value, rawRow);
    if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== '') {
      normalized[canonicalKey] = normalizedValue;
    }
  });

  if (normalized.revenue == null && normalized.quantity != null && normalized.unitPrice != null) {
    normalized.revenue = Number((normalized.quantity * normalized.unitPrice).toFixed(2));
  }

  if (normalized.cost != null && normalized.revenue != null) {
    normalized.profit = Number((normalized.revenue - normalized.cost).toFixed(2));
  }

  if (Object.keys(normalized).length === 0) {
    return null;
  }

  return normalized;
};

export const normalizeRows = (rows) => {
  const normalizedRows = [];
  (rows || []).forEach((row) => {
    const normalized = normalizeRow(row);
    if (normalized && Object.keys(normalized).length > 0) {
      normalizedRows.push(normalized);
    }
  });
  return normalizedRows;
};
