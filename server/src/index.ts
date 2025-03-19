// src/index.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import dbConnect from './lib/mongodb';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
import usersRouter from './routes/users';
import statsRouter from './routes/stats';
import uploadRouter from './routes/upload';
import competitionsRouter from './routes/competitions';
import agentsRouter from './routes/agents';
import activitiesRouter from './routes/activities';

app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/competitions', competitionsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/activities', activitiesRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start server with port fallback
const startServer = async () => {
  try {
    await dbConnect();
    
    // Try to start server on preferred port, fallback to other ports if busy
    const tryPort = (portToTry: number): Promise<number> => {
      return new Promise((resolve, reject) => {
        const server = app.listen(portToTry)
          .once('listening', () => {
            resolve(portToTry);
          })
          .once('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              tryPort(portToTry + 1)
                .then(resolve)
                .catch(reject);
            } else {
              reject(err);
            }
          });
      });
    };

    const actualPort = await tryPort(Number(port));
    console.log(`Server is running on port ${actualPort}`);
    console.log(`Frontend URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();