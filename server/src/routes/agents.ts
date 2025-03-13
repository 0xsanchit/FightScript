import { Router } from 'express';
import Agent from '../models/Agent'; // Adjust the path as necessary

const router = Router();

// Get agents by user wallet address
router.get('/:wallet', async (req, res) => {
  try {
    const agents = await Agent.find({ user: req.params.wallet });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new agent
router.post('/', async (req, res) => {
  try {
    const newAgent = new Agent(req.body);
    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
