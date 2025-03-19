import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  description: string;
  category: string;
  winRate: number;
  totalGames: number;
  totalWins: number;
  createdBy: mongoose.Types.ObjectId;
  fileUrl: string;
  status: 'active' | 'inactive' | 'processing';
  metadata: {
    version: string;
    framework: string;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  winRate: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'processing'],
    default: 'processing'
  },
  metadata: {
    version: { type: String, required: true },
    framework: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
AgentSchema.pre('save', function(this: IAgent, next) {
  this.updatedAt = new Date();
  this.metadata.lastUpdated = new Date();
  next();
});

// Calculate win rate before saving
AgentSchema.pre('save', function(this: IAgent, next) {
  if (this.totalGames > 0) {
    this.winRate = (this.totalWins / this.totalGames) * 100;
  }
  next();
});

export default mongoose.model<IAgent>('Agent', AgentSchema);
