import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import Report from '../models/Report.js';
import analyticsService from './analyticsService.js';

// Clean in-memory store for reports
let inMemoryReports = [];

export const generateRealReport = async ({ reportType = 'Executive Summary', title, period = 'all', businessId = 'dev-business-001' }) => {
  const summary = await analyticsService.getAnalyticsSummary(businessId, period);

  if (!summary.hasData) {
    throw new Error('No business data available. Please upload your CSV, Excel, or PDF data in the Upload Center before generating a report.');
  }

  const topProducts = await analyticsService.getTopProducts(businessId, period, 5);
  const categories = await analyticsService.getCategoryPerformance(businessId, period);

  const reportId = 'rep_' + Date.now();
  const reportName = title || `${reportType} - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  const insights = [
    `Total Revenue calculated at $${summary.totalRevenue.toLocaleString()}`,
    `Total Operating Expenses: $${summary.totalCost.toLocaleString()}`,
    `Net Operating Profit: $${summary.totalProfit.toLocaleString()}`,
    `Profit Margin: ${summary.profitMargin}%`,
    `Total Transactions: ${summary.totalSales} across ${summary.totalProducts} distinct products.`
  ];

  const recommendations = [];
  if (summary.profitMargin < 20) {
    recommendations.push('Operating expenses are consuming over 80% of revenue. Audit COGS and vendor agreements.');
  } else {
    recommendations.push('Healthy profit margin above 20%. Consider re-investing capital into high-performing categories.');
  }

  if (topProducts.length > 0) {
    recommendations.push(`Scale inventory and marketing focus for top revenue item: '${topProducts[0].productName}'.`);
  }

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfFileName = `${reportId}.pdf`;
  const pdfFilePath = path.join(reportsDir, pdfFileName);

  // Generate real PDF file with PDFKit
  await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(pdfFilePath);
      doc.pipe(stream);

      // PDF Header
      doc.fontSize(22).fillColor('#1e1b4b').text('BizMind AI - Business Intelligence Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#4338ca').text(reportName, { align: 'center' });
      doc.fontSize(10).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1.5);

      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Section 1: Key Metrics
      doc.fontSize(14).fillColor('#0f172a').text('1. Executive Financial Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#334155');
      doc.text(`Total Gross Revenue:  $${summary.totalRevenue.toLocaleString()}`);
      doc.text(`Total Cost & Expenses: $${summary.totalCost.toLocaleString()}`);
      doc.text(`Net Profit:             $${summary.totalProfit.toLocaleString()}`);
      doc.text(`Profit Margin:          ${summary.profitMargin}%`);
      doc.text(`Total Sales Count:      ${summary.totalSales}`);
      doc.text(`Average Order Value:    $${summary.averageOrderValue}`);
      doc.moveDown(1.5);

      // Section 2: Top Products
      if (topProducts.length > 0) {
        doc.fontSize(14).fillColor('#0f172a').text('2. Top Performing Products', { underline: true });
        doc.moveDown(0.5);
        topProducts.forEach((p, idx) => {
          doc.fontSize(10).fillColor('#334155').text(`${idx + 1}. ${p.productName} (${p.category}): $${p.totalRevenue.toLocaleString()} (${p.totalUnits} units)`);
        });
        doc.moveDown(1.5);
      }

      // Section 3: Recommendations
      doc.fontSize(14).fillColor('#0f172a').text('3. AI Business Recommendations', { underline: true });
      doc.moveDown(0.5);
      recommendations.forEach((rec, idx) => {
        doc.fontSize(10).fillColor('#334155').text(`• ${rec}`);
      });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });

  const downloadUrl = `/api/report/${reportId}/download`;

  const reportPayload = {
    _id: reportId,
    businessId,
    reportName,
    title: reportName,
    reportType,
    summary: `Verified financial audit calculated from ${summary.totalSales} sales records. Revenue: $${summary.totalRevenue.toLocaleString()}, Profit Margin: ${summary.profitMargin}%.`,
    metrics: summary,
    insights,
    recommendations,
    filePath: pdfFilePath,
    downloadUrl,
    createdAt: new Date()
  };

  let savedReport = null;
  try {
    savedReport = await Report.create(reportPayload);
  } catch (err) {
    console.warn('Report DB save fallback:', err.message);
  }

  const finalRecord = savedReport ? savedReport.toObject() : reportPayload;
  inMemoryReports.unshift(finalRecord);

  return finalRecord;
};

export const getReportsHistory = async (businessId = 'dev-business-001') => {
  let reports = [];
  try {
    reports = await Report.find({ businessId }).sort({ createdAt: -1 }).lean();
  } catch (err) {
    console.warn('MongoDB report history fetch warning:', err.message);
  }

  if (!reports || reports.length === 0) {
    reports = inMemoryReports;
  }

  return reports;
};

export const getReportById = async (reportId) => {
  let report = null;
  try {
    report = await Report.findById(reportId).lean();
  } catch (e) { /* ignore */ }

  if (!report) {
    report = inMemoryReports.find(r => r._id === reportId || r.id === reportId);
  }

  return report;
};

export const deleteReport = async (reportId) => {
  try {
    await Report.findByIdAndDelete(reportId);
  } catch (e) { /* ignore */ }

  const idx = inMemoryReports.findIndex(r => r._id === reportId || r.id === reportId);
  if (idx !== -1) {
    const item = inMemoryReports[idx];
    if (item.filePath && fs.existsSync(item.filePath)) {
      try { fs.unlinkSync(item.filePath); } catch (e) { /* ignore */ }
    }
    inMemoryReports.splice(idx, 1);
  }

  return true;
};

export default {
  generateRealReport,
  getReportsHistory,
  getReportById,
  deleteReport
};
