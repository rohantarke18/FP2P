import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest, requireAuth } from '../middleware/auth';

export const uploadRouter = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 15 MB limit
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`File format "${file.mimetype}" is not supported. Permitted formats: JPEG, PNG, WEBP, MP4, and PDF documents.`));
    }
  },
});

// POST /api/upload - Multipart upload
uploadRouter.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'FILE_TOO_LARGE',
          message: 'File exceeds the maximum allowed 15MB limit.',
        });
      }
      return res.status(400).json({ error: 'UPLOAD_ERROR', message: err.message });
    } else if (err) {
      return res.status(400).json({ error: 'INVALID_FILE', message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'No file was uploaded.' });
    }

    let fileType: 'image' | 'video' | 'document' = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }

    // Served publicly via /uploads/ filename
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      evidence: {
        id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: req.file.originalname,
        type: fileType,
        url: fileUrl,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      },
    });
  });
});
