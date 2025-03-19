// src/routes/competitions.ts
import express from "express";
import dbConnect from "../lib/mongodb"; // Correct path
import Competition from "../models/Competition"; // Correct path

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

export default router; // Ensure this line is present