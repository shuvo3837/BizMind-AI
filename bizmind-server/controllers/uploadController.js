import fs from 'fs';
import path from 'path';
import { processUpload, parseFileRows } from '../services/fileProcessor.js';
import { detectDataTypes } from '../services/dataDetector.js';
import Upload from '../models/Upload.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Report from '../models/Report.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

const resolveBusinessId = (req) => req.user?.businessId;

const REPORT_TITLE = 'BizMind AI Business Analysis Report';

const buildDatasetReport = async ({ userId, businessId, datasetId }) => {
  const ownerFilter = { userId, businessId, uploadId: datasetId };
  const [sales, expenses, products, inventory] = await Promise.all([
    Sale.find(ownerFilter).lean(),
    Expense.find(ownerFilter).lean(),
    Product.find(ownerFilter).lean(),
    Inventory.find(ownerFilter).lean(),
  ]);

  const totalRecords =
    sales.length + expenses.length + products.length + inventory.length;
  if (totalRecords === 0) return null;

  const totalRevenue = sales.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin =
    totalRevenue > 0
      ? Number(((totalProfit / totalRevenue) * 100).toFixed(2))
      : 0;

  const productRevenue = new Map();
  sales.forEach((s) => {
    const key = s.productName || 'Unknown';
    productRevenue.set(key, (productRevenue.get(key) || 0) + (s.revenue || 0));
  });
  const topProducts = Array.from(productRevenue.entries())
    .map(([productName, revenue]) => ({ productName, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const categoryRevenue = new Map();
  sales.forEach((s) => {
    const key = s.category || 'General';
    categoryRevenue.set(key, (categoryRevenue.get(key) || 0) + (s.revenue || 0));
  });
  const revenueByCategory = Array.from(categoryRevenue.entries())
    .map(([category, revenue]) => ({
      category,
      revenue,
      share:
        totalRevenue > 0
          ? Number(((revenue / totalRevenue) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const expenseByCategoryMap = new Map();
  expenses.forEach((e) => {
    const key = e.category || 'General';
    expenseByCategoryMap.set(
      key,
      (expenseByCategoryMap.get(key) || 0) + (e.amount || 0)
    );
  });
  const expenseByCategory = Array.from(expenseByCategoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      share:
        totalExpenses > 0
          ? Number(((amount / totalExpenses) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return Report.create({
    businessId,
    userId,
    title: REPORT_TITLE,
    reportType: 'Executive Summary',
    period: 'monthly',
    startDate: new Date(),
    endDate: new Date(),
    summary: {
      totalRevenue,
      totalProfit,
      totalExpenses,
      totalSales: sales.length,
      profitMargin,
      topProducts,
      revenueByCategory,
      expenseByCategory,
    },
    aiInsights: '',
    status: 'completed',
  });
};

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return fail(res, 'No file was uploaded. Use the multipart "file" field.', 400);
  }

  const businessId = resolveBusinessId(req);
  if (!businessId) {
    try { fs.unlinkSync(req.file.path); } catch (e) { /* noop */ }
    return fail(res, 'No business is linked to this account. Create a business first.', 400);
  }

  try {
    const result = await processUpload({
      file: req.file,
      businessId,
      userId: req.user._id,
    });

    let autoReport = null;
    try {
      autoReport = await buildDatasetReport({
        userId: req.user._id,
        businessId,
        datasetId: result._id,
      });
    } catch (reportErr) {
      // Don't fail the upload if report generation fails; just log it.
      console.warn('Auto report generation failed:', reportErr?.message || reportErr);
    }

    const baseMessage = `File processed successfully. ${result.recordsProcessed || 0} records extracted.`;
    const message = autoReport
      ? `${baseMessage} Report "${REPORT_TITLE}" generated.`
      : baseMessage;

    return ok(res, message, {
      success: true,
      datasetId: result._id,
      uploadId: result._id,
      fileName: req.file.originalname,
      fileType: result.fileType,
      status: result.status,
      records: result.recordsProcessed,
      recordsProcessed: result.recordsProcessed,
      detectedDataTypes: result.detectedDataTypes || [],
      summary: result.summary || null,
      autoReport: autoReport
        ? {
            id: autoReport._id,
            title: autoReport.title,
            reportType: autoReport.reportType,
            status: autoReport.status,
            totalRevenue: autoReport.summary?.totalRevenue || 0,
            totalProfit: autoReport.summary?.totalProfit || 0,
            totalSales: autoReport.summary?.totalSales || 0,
            profitMargin: autoReport.summary?.profitMargin || 0,
          }
        : null,
      message,
    });
  } catch (error) {
    try { fs.unlinkSync(req.file.path); } catch (e) { /* noop */ }
    return fail(res, error.message || 'Failed to process uploaded file.', 500);
  }
});

export const getUploads = asyncHandler(async (req, res) => {
  const businessId = resolveBusinessId(req);
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const uploads = await Upload.find({ businessId, userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('-filePath')
    .lean();

  return ok(res, 'Uploads retrieved.', uploads);
});

export const getUploadById = asyncHandler(async (req, res) => {
  const businessId = resolveBusinessId(req);
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const upload = await Upload.findOne({ _id: req.params.id, businessId, userId: req.user._id })
    .select('-filePath')
    .lean();

  if (!upload) return fail(res, 'Upload not found.', 404);
  return ok(res, 'Upload retrieved.', upload);
});

export const previewFile = asyncHandler(async (req, res) => {
  const businessId = resolveBusinessId(req);
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  if (!req.file) return fail(res, 'No file uploaded for preview.', 400);

  try {
    const rows = await parseFileRows(req.file.path, req.file.originalname);
    const detected = detectDataTypes(rows);
    const preview = (rows || []).slice(0, 25);

    try { fs.unlinkSync(req.file.path); } catch (e) { /* noop */ }

    return ok(res, 'File preview generated.', {
      totalRows: (rows || []).length,
      preview,
      detectedDataTypes: detected,
    });
  } catch (error) {
    try { fs.unlinkSync(req.file.path); } catch (e) { /* noop */ }
    return fail(res, error.message || 'Failed to preview file.', 500);
  }
});

export const deleteUpload = asyncHandler(async (req, res) => {
  const businessId = resolveBusinessId(req);
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const upload = await Upload.findOne({ _id: req.params.id, businessId, userId: req.user._id });
  if (!upload) return fail(res, 'Upload not found.', 404);

  try {
    if (upload.filePath && fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }
  } catch (e) { /* noop */ }

  await upload.deleteOne();
  return ok(res, 'Upload deleted.', { id: req.params.id });
});
