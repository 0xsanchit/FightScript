import express from 'express'
import dbConnect from '../lib/mongodb'
import User from '../models/User'

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

export default router 