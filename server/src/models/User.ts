import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
