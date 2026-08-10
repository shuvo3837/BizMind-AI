import fs from 'fs';
import path from 'path';
import { processUpload, parseFileRows } from '../services/fileProcessor.js';
import { detectDataTypes } from '../services/dataDetector.js';
import Upload from '../models/Upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

const resolveBusinessId = (req) => req.user?.businessId;

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

    return ok(res, `File processed successfully. ${result.recordsProcessed || 0} records extracted.`, {
      uploadId: result._id,
      fileType: result.fileType,
      status: result.status,
      recordsProcessed: result.recordsProcessed,
      detectedDataTypes: result.detectedDataTypes || [],
      summary: result.summary || null,
    });
  } catch (error) {
    try { fs.unlinkSync(req.file.path); } catch (e) { /* noop */ }
    return fail(res, error.message || 'Failed to process uploaded file.', 500);
  }
});

export const getUploads = asyncHandler(async (req, res) => {
  const businessId = resolveBusinessId(req);
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const uploads = await Upload.find({ businessId })
    .sort({ createdAt: -1 })
    .select('-filePath')
    .lean();

  return ok(res, 'Uploads retrieved.', uploads);
});

export const getUploadById = asyncHandler(async (req, res) => {
  const businessId = resolveBusinessId(req);
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const upload = await Upload.findOne({ _id: req.params.id, businessId })
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

  const upload = await Upload.findOne({ _id: req.params.id, businessId });
  if (!upload) return fail(res, 'Upload not found.', 404);

  try {
    if (upload.filePath && fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }
  } catch (e) { /* noop */ }

  await upload.deleteOne();
  return ok(res, 'Upload deleted.', { id: req.params.id });
});
