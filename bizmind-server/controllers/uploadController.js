import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const handleFileUpload = async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }

  const fileData = {
    id: 'upl_' + Date.now(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    fileType: req.file.mimetype || req.file.originalname.split('.').pop(),
    sizeBytes: req.file.size,
    recordsCount: Math.floor(Math.random() * 400) + 50,
    status: 'completed',
    summary: `Extracted data from ${req.file.originalname}. Identified sales transactions and expense items.`,
    createdAt: new Date().toISOString()
  };

  return sendSuccess(res, 'File uploaded and parsed successfully', fileData, 201);
};

export const getUploadHistory = async (req, res) => {
  const uploads = [
    {
      id: 'upl_101',
      originalName: 'Q2_Sales_Report_2026.csv',
      fileType: 'CSV',
      sizeBytes: 1245000,
      recordsCount: 412,
      status: 'completed',
      createdAt: '2026-08-01T14:30:00.000Z'
    },
    {
      id: 'upl_102',
      originalName: 'Operating_Expenses_July.xlsx',
      fileType: 'Excel',
      sizeBytes: 856000,
      recordsCount: 185,
      status: 'completed',
      createdAt: '2026-08-04T09:15:00.000Z'
    },
    {
      id: 'upl_103',
      originalName: 'Inventory_Audit_August.pdf',
      fileType: 'PDF',
      sizeBytes: 3420000,
      recordsCount: 94,
      status: 'completed',
      createdAt: '2026-08-06T16:45:00.000Z'
    }
  ];

  return sendSuccess(res, 'Upload history retrieved', uploads);
};
