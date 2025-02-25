import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: Request) {
  try {
    // Get wallet from query parameter instead of cookie
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json({ error: 'No wallet provided' }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findOne({ walletAddress: wallet })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress, stats, totalEarnings, ...userData } = body

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress })
    if (existingUser) {
      return NextResponse.json(existingUser)
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

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
} 