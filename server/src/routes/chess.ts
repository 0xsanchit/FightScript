import express from 'express';
import { ChessEngine } from '../engine/chess-engine';
import path from 'path';
import fs from 'fs';
import Agent from '../models/Agent';

const router = express.Router();

// Get engine status
router.get('/status', async (req, res) => {
  const engine = new ChessEngine();
  try {
    const status = await engine.getEngineInfo();
    res.json(status);
  } catch (error) {
    console.error('Engine status error:', error);
    res.status(500).json({ 
      error: 'Failed to get engine status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    engine.cleanup();
  }
});

// Start a match
router.post('/match', async (req, res) => {
  const { agent1Id, agent2Id } = req.body;
  const engine = new ChessEngine();

  try {
    const [agent1, agent2] = await Promise.all([
      Agent.findById(agent1Id),
      Agent.findById(agent2Id)
    ]);

    if (!agent1 || !agent2) {
      return res.status(404).json({ error: 'One or both agents not found' });
    }

    // Changed from runMatch to runGame
    const result = await engine.runGame(agent1.fileId, agent2.fileId);

    // Update statistics
    if (result.winner === 1) {
      await Promise.all([
        Agent.findByIdAndUpdate(agent1Id, { $inc: { wins: 1 } }),
        Agent.findByIdAndUpdate(agent2Id, { $inc: { losses: 1 } })
      ]);
    } else if (result.winner === 2) {
      await Promise.all([
        Agent.findByIdAndUpdate(agent2Id, { $inc: { wins: 1 } }),
        Agent.findByIdAndUpdate(agent1Id, { $inc: { losses: 1 } })
      ]);
    }

    res.json({
      ...result,
      agent1: { id: agent1._id, name: agent1.name },
      agent2: { id: agent2._id, name: agent2.name }
    });
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ 
      error: 'Match failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    engine.cleanup();
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

export default router; 