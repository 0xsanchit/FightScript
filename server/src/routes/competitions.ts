// src/routes/competitions.ts
import express from "express";
import dbConnect from "../lib/mongodb"; // Correct path
import Competition from "../models/Competition"; // Correct path
import { ChessEngine } from '../engine/chess-engine'
import path from 'path'
import Agent from '../models/Agent';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await dbConnect();
    const competitions = await Competition.find({})
      .populate("participants", "username walletAddress")
      .populate("winner", "username walletAddress")
      .populate("createdBy", "username walletAddress")
      .populate({
        path: "submissions",
        populate: {
          path: "agent",
          select: "name category winRate",
        },
      })
      .lean()
      .exec();

    return res.json(competitions);
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return res.status(500).json({ error: "Failed to fetch competitions" });
  }
});

// Get engine status and info
router.get('/chess/status', async (req, res) => {
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

// Get available agents for a user
router.get('/chess/agents/:wallet', async (req, res) => {
  try {
    const agents = await Agent.find({ 
      walletAddress: req.params.wallet,
      status: 'active'
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Start a match
router.post('/chess/match', async (req, res) => {
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
    res.status(500).json({ error: 'Match failed' });
  } finally {
    engine.cleanup();
  }
});

export default router; // Ensure this line is present