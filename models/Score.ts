import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  scoreId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competition",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Score = mongoose.models.Score || mongoose.model("Score", ScoreSchema);

export default Score; 