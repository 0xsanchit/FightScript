import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  fileId: string;
  walletAddress: string;
  userId: mongoose.Types.ObjectId; // Add reference to user
  wins: number;
  losses: number;
  draws: number;
  points: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const AgentSchema = new Schema({
  name: { type: String, required: true },
  fileId: { type: String, required: true }, // Google Drive file ID
  walletAddress: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Add reference to User model
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster queries
AgentSchema.index({ userId: 1 });
AgentSchema.index({ walletAddress: 1 });
AgentSchema.index({ points: -1 }); // Add index for points in descending order

export default mongoose.model<IAgent>('Agent', AgentSchema);
