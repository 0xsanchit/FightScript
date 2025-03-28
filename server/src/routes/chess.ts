import express from 'express';
import { ChessEngine } from '../engine/chess-engine';
import multer from 'multer';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import Agent from '../models/Agent';
import { spawn } from 'child_process';

const router = express.Router();
const engine = new ChessEngine();

// Create a Map to store active matches
const matches: Map<string, {
  status: string;
  message: string;
  engineProcess?: any;
  moves: string[];
  winner?: string;
}> = new Map();

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

// Add path to Stockfish executable - adjust this path based on your system
const STOCKFISH_PATH = process.platform === 'win32' 
  ? path.join(process.cwd(), 'src/engine/stockfish/stockfish.exe')  // Windows
  : path.join(process.cwd(), 'src/engine/stockfish/stockfish');     // Linux/Mac

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

// POST /api/chess/match
router.post('/match', async (req, res) => {
  try {
    const { fileId, opponent } = req.body;

    // 1. Download the agent file from Google Drive
    const dest = path.join(process.cwd(), 'uploads', 'temp', `${fileId}.cpp`);
    await downloadFromDrive(fileId, dest);

    // 2. Get the aggressive bot path
    const aggressiveBotPath = path.join(process.cwd(), 'src/engine/agents/aggressive_bot.cpp');

    // 3. Generate match ID
    const matchId = Date.now().toString();

    // 4. Store initial match state
    matches.set(matchId, {
      status: 'compiling',
      message: 'Compiling agents...',
      moves: [],
    });

    try {
      // 5. Check if Stockfish exists
      if (!fs.existsSync(STOCKFISH_PATH)) {
        throw new Error('Stockfish executable not found. Please ensure it is installed correctly.');
      }

      // 6. Start the match process
      const engineProcess = spawn(STOCKFISH_PATH, [dest, aggressiveBotPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      matches.get(matchId)!.engineProcess = engineProcess;
      matches.get(matchId)!.status = 'running';
      matches.get(matchId)!.message = 'Match in progress';

      // Handle engine output
      engineProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log('Engine output:', output);
        
        const currentMatch = matches.get(matchId);
        if (currentMatch) {
          currentMatch.moves.push(output);
        }
      });

      // Handle engine errors
      engineProcess.stderr.on('data', (data: Buffer) => {
        console.error('Engine error:', data.toString());
      });

      // Handle engine completion
      engineProcess.on('close', (code: number) => {
        const currentMatch = matches.get(matchId);
        if (currentMatch) {
          currentMatch.status = code === 0 ? 'completed' : 'error';
          currentMatch.message = code === 0 
            ? 'Match completed successfully' 
            : `Match failed with code ${code}`;
        }
      });

      // Return match ID for status polling
      res.json({ 
        matchId,
        status: 'started',
        message: 'Match started successfully' 
      });

    } catch (error) {
      matches.set(matchId, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to start match',
        moves: []
      });
      throw error;
    }

  } catch (error) {
    console.error('Failed to start match:', error);
    res.status(500).json({ 
      error: 'Failed to start match',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to download file from Google Drive
async function downloadFromDrive(fileId: string, dest: string) {
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    await new Promise<void>((resolve, reject) => {
      const dest_stream = fs.createWriteStream(dest);
      response.data
        .pipe(dest_stream)
        .on('finish', () => resolve())
        .on('error', (error) => reject(error));
    });
  } catch (error) {
    throw new Error(`Failed to download file from Drive: ${error}`);
  }
}

// GET /api/chess/match/:id/status
router.get('/match/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const match = matches.get(id);

    if (!match) {
      return res.status(404).json({ 
        error: 'Match not found' 
      });
    }

    res.json({
      status: match.status,
      message: match.message,
      winner: match.winner,
      moves: match.moves
    });

  } catch (error) {
    console.error('Failed to get match status:', error);
    res.status(500).json({ 
      error: 'Failed to get match status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

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

// Clean up completed matches periodically
setInterval(() => {
  for (const [id, match] of matches.entries()) {
    if (match.status === 'completed' || match.status === 'error') {
      // Keep matches for 1 hour before cleaning up
      setTimeout(() => {
        matches.delete(id);
      }, 3600000); // 1 hour
    }
  }
}, 300000); // Check every 5 minutes

export default router; 