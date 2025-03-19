// src/routes/agents.ts
import express from "express";
import dbConnect from "../lib/mongodb"; // Correct path
import Agent from "../models/Agent"; // Correct path
import User from "../models/User";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { wallet } = req.query; // Use query parameters

    if (!wallet) {
      return res.status(400).json({ error: "No wallet provided" });
    }

    await dbConnect();
    
    // First find the user by wallet address
    const user = await User.findOne({ walletAddress: wallet });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Then find agents created by this user
    const agents = await Agent.find({ createdBy: user._id })
      .select("name category description winRate totalGames totalWins status metadata")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return res.status(500).json({ error: "Failed to fetch agents" });
  }
});

export default router; // Ensure this line is present