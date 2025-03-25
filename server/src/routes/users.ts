import express from 'express'
import dbConnect from '../lib/mongodb'
import User from '../models/User'
import Agent from '../models/Agent'

const router = express.Router()

// GET /api/users?wallet=:wallet
router.get('/', async (req, res) => {
  try {
    const { wallet } = req.query
    
    if (!wallet) {
      return res.status(400).json({ error: 'No wallet address provided' })
    }

    await dbConnect()
    const user = await User.findOne({ walletAddress: wallet }).lean()
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json(user)
  } catch (error: any) {
    console.error('Failed to fetch user:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch user data', 
      details: error?.message || 'Unknown error'
    })
  }
})

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { walletAddress, stats, totalEarnings, ...userData } = req.body

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress })
    if (existingUser) {
      return res.json(existingUser)
    }

    // Create new user with stats
    const user = await User.create({
      walletAddress,
      ...userData,
      stats,
      totalEarnings,
      role: 'user',
      createdAt: new Date()
    })

    return res.json(user)
  } catch (error: any) {
    console.error('Failed to create user:', error)
    return res.status(500).json({ 
      error: 'Failed to create user',
      details: error?.message || 'Unknown error'
    })
  }
})

router.get('/stats', async (req, res) => {
  const { wallet } = req.query;

  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    const user = await User.findOne({ walletAddress: wallet });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const agents = await Agent.find({ walletAddress: wallet });
    const totalGames = agents.reduce((sum, agent) => sum + agent.wins + agent.losses, 0);

    res.json({
      username: user.username,
      walletAddress: user.walletAddress,
      totalGames,
      agents: agents.map(agent => ({
        _id: agent._id,
        name: agent.name,
        wins: agent.wins,
        losses: agent.losses,
        status: agent.status,
        createdAt: agent.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Add this route to create a test user
router.post('/create-test', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res.json(existingUser);
    }

    // Create new test user
    const user = await User.create({
      walletAddress,
      username: `User${walletAddress.slice(0, 4)}`,
      profileImage: '',
      bio: 'Test user',
      stats: {
        totalAgents: 0,
        competitionsWon: 0,
        tokensEarned: 0,
        winRate: 0
      },
      totalEarnings: 0
    });

    return res.json(user);
  } catch (error: any) {
    console.error('Failed to create test user:', error);
    return res.status(500).json({ 
      error: 'Failed to create test user',
      details: error.message
    });
  }
});

export default router 