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

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.cpp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only C++ (.cpp) files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Google Drive API setup
const keyFilePath = path.join(process.cwd(), '..', 'public', 'co3pe-453808-0e053faf0259.json');
console.log('Google Drive key file path:', keyFilePath);

if (!fs.existsSync(keyFilePath)) {
  console.error('Google Drive credentials file not found at:', keyFilePath);
  throw new Error('Google Drive credentials file not found');
}

const auth = new GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({
  version: 'v3',
  auth: auth
});

// POST endpoint to handle file uploads
router.post("/agent", upload.single("file"), async (req, res) => {
  console.log('Upload request received:', {
    file: req.file,
    body: req.body,
    headers: req.headers
  });

  if (!req.file) {
    console.log('No file in request');
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    console.log('Starting Google Drive upload for file:', req.file.filename);
    
    // Verify file exists before upload
    if (!fs.existsSync(req.file.path)) {
      throw new Error('Uploaded file not found');
    }

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: req.file.filename,
        mimeType: 'text/x-c++src',
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || '1zZjjkeo17fQBwHn2fz5OYIXUnsNonLh9']
      },
      media: {
        mimeType: 'text/x-c++src',
        body: fs.createReadStream(req.file.path),
      },
    });

    console.log('File uploaded to Google Drive:', response.data.id);

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);
    console.log('Temporary file cleaned up');

    // Return the file information
    res.json({
      message: 'Agent uploaded successfully',
      fileId: response.data.id,
      originalName: req.file.originalname,
      driveUrl: `https://drive.google.com/file/d/${response.data.id}/view`
    });
  } catch (error: any) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Clean up the temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Send more detailed error response
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message,
      code: error.code
    });
  }
});

export default router;