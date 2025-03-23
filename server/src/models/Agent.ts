import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  fileId: string;
  walletAddress: string;
  wins: number;
  losses: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const AgentSchema = new Schema({
  name: { type: String, required: true },
  fileId: { type: String, required: true }, // Google Drive file ID
  walletAddress: { type: String, required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAgent>('Agent', AgentSchema);
