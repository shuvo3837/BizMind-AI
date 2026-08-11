import path from 'path';
import mongoose from 'mongoose';
import { parseCSVFile } from './csvProcessor.js';
import { parseExcelFile } from './excelProcessor.js';
import { parsePDFFile } from './pdfProcessor.js';
import { parseImageFile } from './imageProcessor.js';
import { detectDataTypes } from './dataDetector.js';
import { normalizeRows } from './dataNormalizer.js';
import Upload from '../models/Upload.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Expense from '../models/Expense.js';
import Inventory from '../models/Inventory.js';

const getFileType = (originalname) => path.extname(originalname).toLowerCase().replace('.', '');

const requireDb = () => {
  if (mongoose.connection.readyState !== 1) {
    const err = new Error(
      'Database is not reachable. Upload cannot be persisted. Please try again once the database is online.'
    );
    err.statusCode = 503;
    err.code = 'DB_UNAVAILABLE';
    throw err;
  }
};

export const parseFileRows = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  switch (ext) {
    case '.csv':
      return await parseCSVFile(filePath);
    case '.xlsx':
    case '.xls':
      return await parseExcelFile(filePath);
    case '.pdf':
      return await parsePDFFile(filePath);
    case '.png':
    case '.jpg':
    case '.jpeg':
      return await parseImageFile(filePath);
    default:
      return [];
  }
};

const buildProductKey = (row) =>
  `${row.productName || 'unknown'}|${row.category || 'uncategorized'}|${row.sku || ''}`;

const buildInventoryKey = (row) =>
  `${row.productName || 'unknown'}|${row.sku || ''}|${row.category || 'uncategorized'}`;

// Coerce an incoming id (string or ObjectId) to a real ObjectId so it matches
// the ObjectId-typed schema. Throws a clear error if it can't be coerced.
const toObjectId = (value, label) => {
  if (value == null) {
    throw new Error(`[fileProcessor] Missing required ${label} for document build.`);
  }
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(String(value));
  }
  throw new Error(`[fileProcessor] Invalid ${label} (${value}); cannot cast to ObjectId.`);
};

const buildSaleDocs = (rows, businessId, userId, uploadId) => {
  const bizId = toObjectId(businessId, 'businessId');
  const ownerId = toObjectId(userId, 'userId');
  const sales = [];
  rows.forEach((row) => {
    const hasSale = row.quantity != null || row.unitPrice != null || row.revenue != null;
    if (!hasSale) return;

    const quantity = row.quantity || 0;
    const unitPrice = row.unitPrice || 0;
    const revenue = row.revenue != null ? row.revenue : (quantity && unitPrice ? quantity * unitPrice : 0);
    const cost = row.cost != null ? row.cost : null;
    const profit = row.profit != null ? row.profit : (revenue != null && cost != null ? revenue - cost : null);

    sales.push({
      businessId: bizId,
      userId: ownerId,
      uploadId,
      date: row.date || new Date(),
      productId: row.productId || null,
      productName: row.productName || row.sku || 'Unknown Product',
      category: row.category || 'Uncategorized',
      customer: row.customer || null,
      region: row.region || null,
      orderId: row.orderId || null,
      quantity,
      unitPrice,
      revenue,
      cost,
      profit,
    });
  });
  return sales;
};

const buildExpenseDocs = (rows, businessId, userId, uploadId) => {
  const bizId = toObjectId(businessId, 'businessId');
  const ownerId = toObjectId(userId, 'userId');
  const expenses = [];
  rows.forEach((row) => {
    const hasExpense = row.amount != null && row.revenue == null && row.quantity == null;
    if (!hasExpense) return;

    expenses.push({
      businessId: bizId,
      userId: ownerId,
      uploadId,
      date: row.date || new Date(),
      category: row.category || 'Other',
      description: row.description || row.productName || 'Expense',
      amount: row.amount || 0,
    });
  });
  return expenses;
};

const buildProductMap = (rows, businessId, userId, uploadId) => {
  const bizId = toObjectId(businessId, 'businessId');
  const ownerId = toObjectId(userId, 'userId');
  const productMap = {};
  rows.forEach((row) => {
    const hasSale = row.quantity != null || row.unitPrice != null || row.revenue != null;
    if (!hasSale) return;

    const productKey = buildProductKey(row);
    if (!productMap[productKey]) {
      productMap[productKey] = {
        businessId: bizId,
        userId: ownerId,
        uploadId,
        name: row.productName || row.sku || 'Unknown Product',
        category: row.category || 'Uncategorized',
        sku: row.sku || null,
        price: row.unitPrice || 0,
        cost: row.cost || 0,
        totalUnitsSold: 0,
        totalRevenue: 0,
        currentStock: row.stock != null ? row.stock : (row.currentStock != null ? row.currentStock : 0),
        reorderLevel: row.reorderLevel || null,
      };
    }
    productMap[productKey].totalUnitsSold += row.quantity || 0;
    productMap[productKey].totalRevenue += row.revenue != null
      ? row.revenue
      : (row.quantity || 0) * (row.unitPrice || 0);
    if (row.cost != null) productMap[productKey].cost = row.cost;
  });
  return productMap;
};

const buildInventoryMap = (rows, businessId, userId, uploadId) => {
  const bizId = toObjectId(businessId, 'businessId');
  const ownerId = toObjectId(userId, 'userId');
  const inventoryMap = {};
  rows.forEach((row) => {
    const hasInventory = row.stock != null || row.currentStock != null;
    if (!hasInventory) return;

    const inventoryKey = buildInventoryKey(row);
    const quantity = row.stock != null ? row.stock : row.currentStock;

    if (!inventoryMap[inventoryKey]) {
      inventoryMap[inventoryKey] = {
        businessId: bizId,
        userId: ownerId,
        uploadId,
        productId: row.productId || null,
        productName: row.productName || row.sku || 'Unknown Product',
        sku: row.sku || null,
        category: row.category || 'Uncategorized',
        quantity: quantity || 0,
        reorderLevel: row.reorderLevel || null,
        unitCost: row.cost || 0,
        inventoryValue: Number(((quantity || 0) * (row.cost || 0)).toFixed(2)),
        date: row.date || new Date(),
      };
    } else {
      const entry = inventoryMap[inventoryKey];
      entry.quantity += quantity || 0;
      entry.inventoryValue = Number((entry.quantity * (entry.unitCost || 0)).toFixed(2));
    }
  });
  return inventoryMap;
};

export const processUpload = async ({ file, businessId, userId }) => {
  requireDb();

  if (!userId) {
    const err = new Error(
      '[upload] userId is required to persist documents. The auth middleware must inject req.user._id before reaching the controller.'
    );
    err.statusCode = 500;
    err.code = 'MISSING_USER_ID';
    throw err;
  }
  if (!businessId) {
    const err = new Error(
      '[upload] businessId is required to persist documents. The auth middleware must inject req.user.businessId before reaching the controller.'
    );
    err.statusCode = 400;
    err.code = 'MISSING_BUSINESS_ID';
    throw err;
  }

  const fileType = getFileType(file.originalname);

  let uploadDoc;
  try {
    uploadDoc = await Upload.create({
      businessId: new mongoose.Types.ObjectId(String(businessId)),
      userId: new mongoose.Types.ObjectId(String(userId)),
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      fileType,
      fileSize: file.size,
      filePath: file.path,
      status: 'processing',
      detectedDataTypes: [],
      recordsProcessed: 0,
      errorMessage: '',
    });
  } catch (err) {
    err.statusCode = err.statusCode || 503;
    err.code = err.code || 'DB_UNAVAILABLE';
    throw err;
  }

  const uploadId = uploadDoc._id;

  try {
    const rawRows = await parseFileRows(file.path, file.originalname);
    const rows = normalizeRows(rawRows);

    if (!Array.isArray(rows) || rows.length === 0) {
      const fileTypeLabel = fileType === 'pdf' ? 'PDF' : fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' ? 'image' : 'file';
      const message = fileType === 'pdf'
        ? 'Unable to extract structured business data from this PDF.'
        : fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg'
          ? 'Unable to extract structured business data from this image.'
          : 'No usable business data could be extracted from the uploaded file.';
      const error = new Error(message);
      error.statusCode = 400;
      throw error;
    }

    const hasBusinessSignals = rows.some((row) => row.revenue != null || row.amount != null || row.cost != null || row.quantity != null || row.stock != null);
    if (!hasBusinessSignals) {
      const error = new Error('The uploaded file did not contain recognizable business metrics.');
      error.statusCode = 400;
      throw error;
    }

    const detectedDataTypes = detectDataTypes(rows);

    const saleDocs = buildSaleDocs(rows, businessId, userId, uploadId);
    const expenseDocs = buildExpenseDocs(rows, businessId, userId, uploadId);
    const productMap = buildProductMap(rows, businessId, userId, uploadId);
    const inventoryMap = buildInventoryMap(rows, businessId, userId, uploadId);

    const persistedSales = saleDocs.length ? (await Sale.insertMany(saleDocs)).length : 0;
    const persistedExpenses = expenseDocs.length ? (await Expense.insertMany(expenseDocs)).length : 0;
    const persistedProducts = Object.keys(productMap).length
      ? (await Product.insertMany(Object.values(productMap))).length
      : 0;
    const persistedInventory = Object.keys(inventoryMap).length
      ? (await Inventory.insertMany(Object.values(inventoryMap))).length
      : 0;

    uploadDoc.detectedDataTypes = detectedDataTypes;
    uploadDoc.status = 'completed';
    uploadDoc.recordsProcessed = rows.length;
    await uploadDoc.save();

    return {
      _id: uploadDoc._id,
      fileType,
      status: 'completed',
      recordsProcessed: rows.length,
      detectedDataTypes,
      summary: {
        sales: persistedSales,
        expenses: persistedExpenses,
        products: persistedProducts,
        inventory: persistedInventory,
      },
      salesCount: saleDocs.length,
      expenseCount: expenseDocs.length,
      productCount: Object.keys(productMap).length,
      inventoryCount: Object.keys(inventoryMap).length,
      rowsProcessed: rows.length,
    };
  } catch (error) {
    // Log the real failure to the terminal so we don't return a generic 500.
    console.error('[upload] Processing failed:', error.message);
    if (error.stack) console.error(error.stack);
    try {
      uploadDoc.status = 'failed';
      uploadDoc.errorMessage = error.message || 'Unknown processing error';
      await uploadDoc.save();
    } catch (saveErr) {
      console.warn('[upload] Could not persist failed-status update:', saveErr.message);
    }
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

