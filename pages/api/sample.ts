// pages/api/sample.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb'; // Ensure this is the correct path to your dbConnect function
import User from '@/models/User'; // Ensure this is the correct path to your User model
import Competition from '@/models/Competition'; // Ensure this is the correct path to your Competition model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await dbConnect(); // Connect to the database

    try {
      // Sample User Data
      const sampleUser = new User({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123', // You should hash passwords in real applications
      });

      // Sample Competition Data
      const sampleCompetition = new Competition({
        competitionId: 'comp-001',
        name: 'Winter Coding Challenge',
        description: 'A competition for coding enthusiasts.',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-10'),
      });

      // Save data to the database
      await sampleUser.save();
      await sampleCompetition.save();

      res.status(201).json({ message: 'Sample data added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add sample data', details: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}