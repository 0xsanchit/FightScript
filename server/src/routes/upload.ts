// src/routes/upload.ts
import express from "express";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { drive_v3 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { ChessEngine } from '../engine/chess-engine'

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.js', '.ts', '.py'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Google Drive API setup
const auth = new GoogleAuth({
  keyFile: path.join(process.cwd(), process.env.GOOGLE_DRIVE_KEY_FILE || ''),
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({
  version: 'v3',
  auth: auth
});

// POST endpoint to handle file uploads
router.post("/agent", upload.single("agent"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Return the file information
    res.json({
      message: 'Agent uploaded successfully',
      agentId: path.basename(req.file.path, path.extname(req.file.path)),
      originalName: req.file.originalname
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message 
    });
  }
});

export default router;