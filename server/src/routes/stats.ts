// src/routes/stats.ts
import express from "express";
import dbConnect from "../lib/mongodb"; // Correct path
import User from "../models/User"; // Correct path

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { wallet } = req.query; // Use query parameters

    if (!wallet) {
      return res.status(400).json({ error: "No wallet provided" });
    }

    await dbConnect();
    const user = await User.findOne({ walletAddress: wallet })
      .select("stats totalEarnings")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

export default router; // Ensure this line is present