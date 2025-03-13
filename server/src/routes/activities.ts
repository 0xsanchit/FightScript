import { Router } from 'express';
import Activity from '../models/Activity'; // Adjust the path as necessary

const router = Router();

// Get activities by user wallet address
router.get('/:wallet', async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.params.wallet });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new activity
router.post('/', async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
