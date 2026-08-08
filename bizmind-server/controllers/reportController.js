import fs from 'fs';
import { generateRealReport, getReportsHistory, getReportById, deleteReport as removeReport } from '../services/reportService.js';
import { getBusinessContext } from '../services/businessContextService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const generateReport = async (req, res) => {
  try {
    const { reportType, title, period } = req.body;
    const { businessId } = await getBusinessContext(req);

    const report = await generateRealReport({ reportType, title, period, businessId });
    return sendSuccess(res, 'Report generated successfully', report, 201);
  } catch (error) {
    console.error('Report generation error:', error);
    return sendError(res, error.message || 'Error generating report', 400);
  }
};

export const getReportsList = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const reports = await getReportsHistory(businessId);

    return sendSuccess(res, 'Reports list retrieved', reports);
  } catch (error) {
    return sendError(res, error.message || 'Error fetching reports', 500);
  }
};

export const downloadReportPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getReportById(id);

    if (!report || !report.filePath || !fs.existsSync(report.filePath)) {
      return sendError(res, 'Report file not found or expired', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.reportName || 'report'}.pdf"`);

    const fileStream = fs.createReadStream(report.filePath);
    return fileStream.pipe(res);
  } catch (error) {
    return sendError(res, error.message || 'Error downloading report PDF', 500);
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await removeReport(id);
    return sendSuccess(res, 'Report deleted successfully', { id });
  } catch (error) {
    return sendError(res, error.message || 'Error deleting report', 500);
  }
};

export default {
  generateReport,
  getReportsList,
  downloadReportPDF,
  deleteReport
};
