import mongoose, { Schema, Document } from 'mongoose';

export interface IChessMatch extends Document {
  bot1: mongoose.Schema.Types.ObjectId,
  bot2: mongoose.Schema.Types.ObjectId,
  result: string,
  moves: string[]
}

type ChessMatchModel = mongoose.Model<IChessMatch, {}>;

const ChessMatchSchema = new Schema({
  bot1: {type:mongoose.Schema.Types.ObjectId, required: true},
  bot2: {type:mongoose.Schema.Types.ObjectId, required: true},
  result: {type: String, required: true},
  moves: [{type: String, required: true}]
});

export default mongoose.model<IChessMatch, ChessMatchModel>('ChessMatch', ChessMatchSchema);
