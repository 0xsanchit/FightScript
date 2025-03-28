// src/index.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import dbConnect from './lib/mongodb';
import fs from 'fs';
import competitionsRouter from './routes/competitions';
import usersRouter from './routes/users';
import statsRouter from './routes/stats';
import uploadRouter from './routes/upload';
import chessRouter from './routes/chess';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads'));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Connect to MongoDB
dbConnect();

// Routes
app.use('/api/competitions', competitionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chess', chessRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});