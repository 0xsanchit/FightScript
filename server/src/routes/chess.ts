import express, { Request } from 'express';
import { ChessEngine } from '../engine/chess-engine';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Agent from '../models/Agent';
import ChessMatch from '../models/ChessMatch';
import { spawn } from 'child_process';
import { chessEngine } from '../engine/chess-engine';
import mongoose from 'mongoose';

// Define a compatible File type
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

// Define the callback types for multer
type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

const router = express.Router();
const engine = new ChessEngine();

// Create a Map to store active matches
const matches: Map<string, {
  status: string;
  message: string;
  engineProcess?: any;
  moves: string[];
  winner?: string;
  engineOutput?: string;
}> = new Map();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/agents',
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function(req, file, cb) {
    if (file.originalname.endsWith('.cpp')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  }
});

// Add path to Stockfish executable - adjust this path based on your system
// const STOCKFISH_PATH = process.platform === 'win32' 
//   ? path.join(process.cwd(), 'src/engine/stockfish/stockfish.exe')  // Windows
//   : path.join(process.cwd(), 'src/engine/stockfish/stockfish');     // Linux/Mac

// Get engine status
// router.get('/status', async (req, res) => {
//   try {
//     const status = await engine.getEngineInfo();
//     res.json(status);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to get engine status' });
//   }
// });

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
    // Check if database is connected
    if (!mongoose.connection.readyState) {
      console.error('Database not connected');
      return res.status(503).json({ 
        error: 'Database not connected',
        message: 'Please try again later'
      });
    }

    const agents = await Agent.find({ status: 'active' })
      .sort({ rating: -1, wins: -1 }) // Sort by points first, then wins
      .limit(100) // Limit to top 100 agents
      .select('name walletAddress wins losses draws points rating');

    // Add rank to each agent
    const leaderboard = agents.map((agent, index) => ({
      id: agent._id,
      name: agent.name || 'Anonymous',
      owner: agent.walletAddress,
      wins: agent.wins || 0,
      losses: agent.losses || 0,
      draws: agent.draws || 0,
      points: agent.points || 0,
      rank: index + 1,
      rating: agent.rating || 1200
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    res.status(500).json({ 
      error: 'Failed to get leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get match status
router.get('/match', async (req, res) => {
  try {
    const { matchId } = req.query;
    
    if (!matchId) {
      console.log('No matchId provided');
      return res.status(400).json({ 
        error: 'Match ID is required',
        status: 'error'
      });
    }

    const match = matches.get(matchId as string);
    
    if (!match) {
      console.log('Match not found:', matchId);
      return res.status(404).json({ 
        error: 'Match not found',
        status: 'error'
      });
    }

    console.log('Match status:', {
      matchId,
      status: match.status,
      message: match.message,
      moves: match.moves?.length || 0,
      hasEngineOutput: !!match.engineOutput
    });

    if (match.status === 'completed' && match.winner !== null) {
      const result = {
        winner: match.winner,
        reason: match.message,
        moves: match.moves,
        engineOutput: match.engineOutput
      };
      return res.json({
        status: match.status,
        message: match.message,
        moves: match.moves,
        result,
        engineOutput: match.engineOutput
      });
    }

    // Return the match status
    const response = {
      status: match.status,
      message: match.message,
      result: match.winner ? {
        winner: match.winner,
        reason: match.message,
        moves: match.moves
      } : undefined,
      engineOutput: match.engineOutput
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting match status:', error);
    res.status(500).json({
      error: 'Failed to get match status',
      status: 'error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function updateElo(r1: number, r2: number, t1: number, t2: number, outcome: "win" | "draw" | "lose") {
  const getK = (matches: number) => matches < 30 ? 40 : matches < 100 ? 20 : 10;

  const K1 = getK(t1);
  const K2 = getK(t2);

  const E1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const E2 = 1 - E1;

  let S1: number, S2: number;

  if (outcome === "win") {
    S1 = 1;
    S2 = 0;
  } else if (outcome === "draw") {
    S1 = S2 = 0.5;
  } else {
    S1 = 0;
    S2 = 1;
  }

  const r1New = r1 + K1 * (S1 - E1);
  const r2New = r2 + K2 * (S2 - E2);

  return {
    r1New: Math.round(r1New),
    r2New: Math.round(r2New),
  };
}


async function conduct_match(agent1_id:mongoose.Schema.Types.ObjectId,agent2_id:mongoose.Schema.Types.ObjectId){
  try{
    const agent1 = await Agent.findOne({_id:agent1_id});
    const agent2 = await Agent.findOne({_id:agent2_id});

    if(agent1 && agent2)
    {
      console.log("Agents found");
      const agent1Path = path.join(process.cwd(), 'uploads', 'agents', agent1.filename);
      const agent2Path = path.join(process.cwd(), 'uploads', 'agents', agent2.filename);
      console.log(agent1Path,agent2Path);

      if (!fs.existsSync(agent1Path)) {
        console.log("Agent1 not found");
        throw new Error(`Agent not found at path: ${agent1Path}`);
      }
      if (!fs.existsSync(agent2Path)) {
        console.log("Agent2 not found");
        throw new Error(`Agent not found at path: ${agent2Path}`);
      }

      console.log("Starting Match");
      const result = await chessEngine.runMatch(agent1Path, agent2Path);

      const match = await ChessMatch.insertOne({
        bot1:agent1._id,
        bot2:agent2._id,
        result: result.winner==1?"win":(result.winner==2?"loss":"draw"),
        reason: result.reason,
        moves: result.moves
      });

      console.log(result);

      const winR =  updateElo(agent1.rating,agent2.rating,(agent1.wins+agent1.losses+agent1.draws),(agent2.wins+agent2.losses+agent2.draws),"win");
      const lossR =  updateElo(agent1.rating,agent2.rating,(agent1.wins+agent1.losses+agent1.draws),(agent2.wins+agent2.losses+agent2.draws),"lose");
      const drawR =  updateElo(agent1.rating,agent2.rating,(agent1.wins+agent1.losses+agent1.draws),(agent2.wins+agent2.losses+agent2.draws),"draw");

      console.log(winR);
      console.log(lossR);
      console.log(drawR);

      if(result.winner == 1)
      {
        await Agent.findOneAndUpdate(
          {_id:agent1_id},
          {
            $inc:{
              wins:1
            },
            $set:{
              rating:winR.r1New
            }
          }
          );
          await Agent.findOneAndUpdate(
            {_id:agent2_id},
            {
            $inc:{
              losses:1
            },
            $set:{
              rating:winR.r2New
            }
          }
            );
      }
      else if(result.winner == 2)
      {
        await Agent.findOneAndUpdate(
          {_id:agent1_id},
          {
          $inc:{
            losses:1
          },
          $set:{
            rating:lossR.r1New
          }
        }
          );
          await Agent.findOneAndUpdate(
            {_id:agent2_id},
            {
            $inc:{
              wins:1
            },
            $set:{
              rating:lossR.r2New
            }
          }
            );
      }
      else
      {
        await Agent.findOneAndUpdate(
          {_id:agent1_id},
          {
          $inc:{
            draws:1
          },
          $set:{
            rating:drawR.r1New
          }
        }
          );
          await Agent.findOneAndUpdate(
            {_id:agent2_id},
            {
            $inc:{
              draws:1
            },
            $set:{
              rating:drawR.r2New
            }
          }
            );
      }

      const reason = result.reason.replace(/[\n\r]/g, '');
      if(reason == "Timeout" || reason == "Exception" || reason == "illegal move" || reason == "agent error")
      {
        console.log("Setting inactive");
        if(result.winner == 1)
        {
          console.log("agent 2");
          await Agent.findOneAndUpdate(
            {_id:agent2_id},
            {
            $set:{
              status:"inactive"
            }
          }
            );
        }
        else if(result.winner == 2)
        {
          console.log("agent 1");
          await Agent.findOneAndUpdate(
            {_id:agent1_id},
            {
            $set:{
              status:"inactive"
            }
          }
            );
        }
      }
    }
  }
  catch(error)
  {
  }
}




// Update the match endpoint to handle errors properly
router.post('/match', async (req, res) => {
  try {
    const { fileId, walletAddress } = req.body;
    console.log('Starting match with walletAddress:', walletAddress);
    
    if (!walletAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing walletAddress in request'
      });
    }

    // Initialize match state
    const matchId = Date.now().toString();
    const matchState = {
      status: 'initializing',
      message: 'Initializing chess engine...',
      moves: [],
      engineOutput: ''
    };
    
    // Store the match state
    matches.set(matchId, matchState);
    console.log('Match initialized with ID:', matchId);

    // Get the full paths for the agents
    const userAgentPath = path.join(process.cwd(), 'uploads', 'agents', `${fileId}`);
    const aggressiveBotPath = path.join(process.cwd(), 'src', 'engine', 'agents', 'random_agent.py');

    console.log('Checking file paths:');
    console.log('User agent path:', userAgentPath);
    console.log('Aggressive bot path:', aggressiveBotPath);

    // Verify files exist
    if (!fs.existsSync(userAgentPath)) {
      throw new Error(`User agent not found at path: ${userAgentPath}`);
    }
    if (!fs.existsSync(aggressiveBotPath)) {
      throw new Error(`Aggressive bot not found at path: ${aggressiveBotPath}`);
    }

    // Return the matchId immediately
    res.json({ 
      status: 'initializing',
      matchId,
      message: 'Match initialization started'
    });

    // Initialize the engine
    try {
      console.log('Initializing chess engine...');
      // await chessEngine.initialize();
      console.log('Chess engine initialized successfully');
      
      // Update match status to running
      const match = matches.get(matchId);
      if (match) {
        match.status = 'running';
        match.message = 'Match in progress...';
        console.log('Match status updated to running');
      }

      // Run the match asynchronously
      console.log('Starting match between agents...');
      const result = await chessEngine.runMatch(userAgentPath, aggressiveBotPath);
      console.log('Match completed with result:', result);
      
      // Update match status and database based on result
      const updatedMatch = matches.get(matchId);
      if (updatedMatch) {
        let points = 0;
        if (result.winner === 1) {
          updatedMatch.status = 'completed';
          updatedMatch.winner = 'user';
          updatedMatch.message = 'Match completed. Your agent won! (+2 points)';
          points = 2;
        } else if (result.winner === 2) {
          updatedMatch.status = 'completed';
          updatedMatch.winner = 'opponent';
          updatedMatch.message = 'Match completed. The aggressive bot won. (+0 points)';
          points = 0;
        } else {
          updatedMatch.status = 'completed';
          updatedMatch.winner = 'draw';
          updatedMatch.message = 'Match completed. The game ended in a draw. (+1 point)';
          points = 1;
        }

        updatedMatch.moves = result.moves;
        updatedMatch.engineOutput = result.engineOutput || '';
        console.log('Match completed successfully:', {
          winner: updatedMatch.winner,
          reason: result.reason,
          moves: result.moves.length
        });

        // Update or create agent in database
        try {
          const agent = await Agent.findOneAndUpdate(
            {
              walletAddress:walletAddress,
              competition:'chess',
              status:'active'
            },
            {
              $inc: {
                wins: result.winner === 1 ? 1 : 0,
                losses: result.winner === 2 ? 1 : 0,
                draws: result.winner === 0 ? 1 : 0,
                points: points
              }
            },
            { upsert: true, new: true }
          );

          console.log('Agent stats updated in database:', {
            walletAddress,
            wins: agent.wins,
            losses: agent.losses,
            draws: agent.draws,
            points: agent.points
          });
        } catch (dbError) {
          console.error('Failed to update agent stats:', dbError);
          // Continue even if database update fails
        }
      }

    } catch (error) {
      console.error('Match failed:', error);
      const match = matches.get(matchId);
      if (match) {
        match.status = 'error';
        match.message = error instanceof Error ? error.message : 'Internal server error';
      }
    }

  } catch (error) {
    console.error('Failed to start match:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
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

async function timerMatch()
{
  const agent1 = await Agent.aggregate([
    { $match: {"status":"active"} },
    {
      $addFields: {
        total: { $add: ["$wins", "$losses", "$draws"] }
      }
    },
    { $sort: { total: 1 } },
    { $limit: 2 }
  ]);
  if(agent1[0] && agent1[1])
  {
    conduct_match(agent1[0]._id,agent1[1]._id);
  }
}

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

setInterval(() => {
  timerMatch();
}, 300000); // Check every 5 minutes

export default router; 