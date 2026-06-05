const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { s3Client, storageMode } = require('../config/s3');

// Ensure local uploads folder exists
const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types
const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only PDF, JPG, PNG, and WebP are allowed.'),
      false
    );
  }
};

// ── S3 Storage ──────────────────────────────────────────────────────────────
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `documents/${uuidv4()}${ext}`);
  },
});

// ── Local Storage ────────────────────────────────────────────────────────────
const localDiskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, LOCAL_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage: storageMode === 's3' ? s3Storage : localDiskStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = { upload };
