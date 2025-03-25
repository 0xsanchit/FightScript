import express from 'express';
import { ChessEngine } from '../engine/chess-engine';
import multer from 'multer';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import Agent from '../models/Agent';

const router = express.Router();
const engine = new ChessEngine();

// Configure Google Drive
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../../credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/agents',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.cpp')) {
      cb(null, true);
    } else {
      cb(new Error('Only .cpp files are allowed'));
    }
  },
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  }
});

// Get engine status
router.get('/status', async (req, res) => {
  try {
    const status = await engine.getEngineInfo();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get engine status' });
  }
});

// Upload agent
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const wallet = req.body.wallet;

    if (!file || !wallet) {
      return res.status(400).json({ error: 'Missing file or wallet address' });
    }

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.filename,
        mimeType: 'text/x-c++src',
      },
      media: {
        mimeType: 'text/x-c++src',
        body: fs.createReadStream(file.path),
      },
    });

    // Save agent info to database
    // ... implement database logic here ...

    res.json({ 
      message: 'Agent uploaded successfully',
      fileId: response.data.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload agent' });
  }
});

// Get user's agent
router.get('/agent/:wallet', async (req, res) => {
  try {
    const wallet = req.params.wallet;
    // Get agent from database
    // ... implement database logic here ...
    res.json({
      id: 'agent_id',
      name: 'Agent Name',
      owner: wallet,
      wins: 0,
      losses: 0,
      rank: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Get leaderboard from database
    // ... implement database logic here ...
    res.json([
      {
        id: 'agent1',
        name: 'Agent 1',
        owner: 'wallet1',
        wins: 5,
        losses: 2,
        rank: 1
      },
      // ... more agents ...
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Start a match
router.post('/match', async (req, res) => {
  try {
    const { agent1Id, agent2Id } = req.body;

    // Get agents from Google Drive
    const agent1Path = await downloadAgent(agent1Id);
    const agent2Path = await downloadAgent(agent2Id);

    // Run the match
    const result = await engine.runMatch(agent1Path, agent2Path);

    // Update rankings in database
    // ... implement database logic here ...

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run match' });
  }
});

async function downloadAgent(fileId: string): Promise<string> {
  const tempPath = path.join(__dirname, '../../uploads/temp', `${fileId}.cpp`);
  
  const dest = fs.createWriteStream(tempPath);
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  
  await new Promise((resolve, reject) => {
    response.data
      .on('end', resolve)
      .on('error', reject)
      .pipe(dest);
  });

  return tempPath;
}

// Get user's agents
router.get('/agents/:wallet', async (req, res) => {
  try {
    const agents = await Agent.find({ 
      walletAddress: req.params.wallet,
      status: 'active'
    });
    res.json(agents);
  } catch (error) {
    console.error('Fetch agents error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch agents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 