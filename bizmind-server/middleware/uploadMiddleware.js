import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    cb(null, `bizmind-${uniqueSuffix}${sanitizedExt}`);
  }
});

const allowedTypesMap = {
  '.csv': ['text/csv', 'application/csv', 'text/x-csv', 'application/vnd.ms-excel', 'text/plain'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
  '.xls': ['application/vnd.ms-excel', 'application/msexcel', 'application/octet-stream'],
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg', 'image/pjpeg'],
  '.jpeg': ['image/jpeg', 'image/pjpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp']
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = Object.keys(allowedTypesMap);

  if (!allowedExts.includes(ext)) {
    return cb(new Error(`Unsupported file type '${ext}'. Allowed types: CSV, Excel (.xlsx, .xls), PDF, Images (.jpg, .jpeg, .png, .webp)`), false);
  }

  // Validate mime type if available
  const validMimes = allowedTypesMap[ext];
  if (file.mimetype && !validMimes.includes(file.mimetype) && file.mimetype !== 'application/octet-stream') {
    // Soft warning/check, proceed if extension matches
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter
});
