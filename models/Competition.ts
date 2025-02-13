import mongoose from "mongoose";

const CompetitionSchema = new mongoose.Schema({
  competitionId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  scores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Score" }], // Reference to scores
});

const Competition = mongoose.models.Competition || mongoose.model("Competition", CompetitionSchema);

export default Competition; 