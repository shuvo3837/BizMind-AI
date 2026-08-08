import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Upload from '../models/Upload.js';
import Sale from '../models/Sale.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { processUploadedFile } from '../services/fileProcessingService.js';
import { getBusinessContext } from '../services/businessContextService.js';

let inMemoryUploads = [];

const getFileCategory = (originalname = '', mimetype = '') => {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === '.csv' || mimetype.includes('csv')) return 'CSV';
  if (ext === '.xlsx' || ext === '.xls' || mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'Excel';
  if (ext === '.pdf' || mimetype.includes('pdf')) return 'PDF';
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) || mimetype.includes('image')) return 'Image';
  return 'Document';
};

const getFileHash = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(buffer).digest('hex');
    }
  } catch (e) {
    console.warn('Hash error:', e.message);
  }
  return null;
};

export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded. Please select a valid CSV, Excel, PDF, or Image file.', 400);
    }

    const { businessId, userId } = await getBusinessContext(req);
    const { filename, originalname, mimetype, size, path: tempFilePath } = req.file;
    const fileCategory = getFileCategory(originalname, mimetype);
    const fileHash = getFileHash(tempFilePath);

    // Duplicate Check using fileHash or originalName + size scoped by businessId
    let existingUpload = null;
    try {
      if (fileHash) {
        existingUpload = await Upload.findOne({ businessId, fileHash }).lean();
      }
      if (!existingUpload) {
        existingUpload = await Upload.findOne({ businessId, originalName: originalname, fileSize: size }).lean();
      }
    } catch (e) {
      // Mongo query warning fallback
    }

    if (!existingUpload) {
      existingUpload = inMemoryUploads.find(
        u => u.businessId === businessId && (u.fileHash === fileHash || (u.originalName === originalname && u.fileSize === size))
      );
    }

    if (existingUpload) {
      // Remove temp file if duplicate
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      }
      return sendSuccess(res, 'File already uploaded. Using existing dataset to prevent duplicate counting.', existingUpload, 200);
    }

    const uploadId = 'upl_' + Date.now();

    // Process file & extract sales transactions
    const extractedData = await processUploadedFile(fileCategory, tempFilePath, originalname, uploadId, businessId);

    console.log('[UPLOAD]', {
      businessId,
      file: originalname,
      recordsProcessed: extractedData.recordsExtracted || 0,
      detectedTypes: extractedData.detectedDataTypes || []
    });

    const uploadPayload = {
      _id: uploadId,
      uploadId: uploadId,
      businessId,
      userId,
      fileName: filename,
      filename: filename,
      originalName: originalname,
      fileType: fileCategory,
      mimeType: mimetype,
      fileSize: size,
      sizeBytes: size,
      filePath: tempFilePath,
      fileHash: fileHash || '',
      status: 'Completed',
      processingStatus: 'Ready',
      recordsCount: extractedData.recordsExtracted || 0,
      detectedDataTypes: extractedData.detectedDataTypes || ['Business Data'],
      extractedData: extractedData || {},
      uploadedAt: new Date()
    };

    let savedDoc = null;
    try {
      savedDoc = await Upload.create(uploadPayload);
    } catch (dbErr) {
      console.warn('MongoDB save warning, falling back to in-memory store:', dbErr.message);
    }

    const finalRecord = savedDoc ? savedDoc.toObject() : uploadPayload;
    inMemoryUploads.unshift(finalRecord);

    return sendSuccess(res, 'File uploaded and parsed successfully.', finalRecord, 201);
  } catch (error) {
    console.error('File Upload Error:', error);
    return sendError(res, error.message || 'Error processing file upload', 500);
  }
};

export const getUploads = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    let uploads = [];
    try {
      uploads = await Upload.find({ businessId }).sort({ uploadedAt: -1 }).lean();
    } catch (dbErr) {
      console.warn('MongoDB fetch warning, serving in-memory uploads:', dbErr.message);
    }

    if (!uploads || uploads.length === 0) {
      uploads = inMemoryUploads.filter(u => u.businessId === businessId);
    }

    return sendSuccess(res, 'Upload history retrieved successfully', uploads);
  } catch (error) {
    console.error('Get Uploads Error:', error);
    return sendSuccess(res, 'Fallback upload history', []);
  }
};

export const getUploadById = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const { id } = req.params;
    let upload = null;

    try {
      upload = await Upload.findOne({ _id: id, businessId }).lean();
    } catch (e) {
      // ignore Mongo ID format errors
    }

    if (!upload) {
      upload = inMemoryUploads.find(u => (u._id === id || u.id === id) && u.businessId === businessId);
    }

    if (!upload) {
      return sendError(res, 'Upload record not found', 404);
    }

    return sendSuccess(res, 'Upload record details retrieved', upload);
  } catch (error) {
    return sendError(res, error.message || 'Error fetching upload record', 500);
  }
};

export const deleteUpload = async (req, res) => {
  try {
    const { businessId } = await getBusinessContext(req);
    const { id } = req.params;
    let deletedDoc = null;

    try {
      deletedDoc = await Upload.findOneAndDelete({ _id: id, businessId });
      await Sale.deleteMany({ uploadId: id, businessId });
    } catch (e) {
      // ignore
    }

    // Also check in-memory store
    const memIndex = inMemoryUploads.findIndex(u => (u._id === id || u.id === id) && u.businessId === businessId);
    if (memIndex !== -1) {
      const item = inMemoryUploads[memIndex];
      if (item.filePath && fs.existsSync(item.filePath)) {
        try { fs.unlinkSync(item.filePath); } catch (e) { /* ignore */ }
      }
      inMemoryUploads.splice(memIndex, 1);
    }

    if (deletedDoc && deletedDoc.filePath && fs.existsSync(deletedDoc.filePath)) {
      try { fs.unlinkSync(deletedDoc.filePath); } catch (e) { /* ignore */ }
    }

    return sendSuccess(res, 'File and parsed data deleted successfully', { id });
  } catch (error) {
    return sendError(res, error.message || 'Error deleting upload record', 500);
  }
};

export default {
  handleFileUpload,
  getUploads,
  getUploadById,
  deleteUpload
};
