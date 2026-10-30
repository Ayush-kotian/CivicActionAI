import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = path.resolve('uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate secure random filename with original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    cb(null, safeName);
  }
});

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP image formats are supported.'));
    }
    cb(null, true);
  }
});
