// src/routes/upload.ts
import express from "express";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { drive_v3 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.py', '.js', '.ts', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
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
router.post("/", upload.single("agent"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const filePath = path.resolve(req.file.path);
  const fileMetadata: drive_v3.Schema$File = {
    name: req.file.originalname,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ''],
  };

  const media = {
    mimeType: req.file.mimetype,
    body: fs.createReadStream(filePath),
  };

  try {
    console.log('Uploading to folder:', process.env.GOOGLE_DRIVE_FOLDER_ID);
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    // Delete the local file after uploading
    fs.unlinkSync(filePath);

    if (response.data && response.data.id) {
      console.log('File uploaded successfully:', response.data.id);
      res.json({ 
        message: "File uploaded successfully", 
        fileId: response.data.id 
      });
    } else {
      throw new Error("No file ID in response");
    }
  } catch (error: any) {
    console.error("Error uploading file to Google Drive:", error);
    res.status(500).json({ error: "File upload failed", details: error.message });
  }
});

export default router;