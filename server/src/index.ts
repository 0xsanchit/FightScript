   // src/index.ts
   import express from 'express';
   import mongoose from 'mongoose';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import userRoutes from './routes/users'; // Import routes
   import agentRoutes from './routes/agents'; // Import routes
   import activityRoutes from './routes/activities'; // Import routes

   dotenv.config();

   const app = express();
   const PORT = process.env.PORT || 5000;

   // Middleware
   app.use(cors());
   app.use(express.json());

   // MongoDB connection
   mongoose.connect(process.env.MONGODB_URI as string, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => console.log('MongoDB connected'))
   .catch(err => console.error('MongoDB connection error:', err));

   // Basic route to test the server
   app.get('/', (req, res) => {
     res.send('Server is running!');
   });

   // Load routes
   app.use('/api/users', userRoutes);
   app.use('/api/agents', agentRoutes);
   app.use('/api/activities', activityRoutes);

   // Start the server
   app.listen(PORT, () => {
     console.log(`Server is running on http://localhost:${PORT}`);
   });