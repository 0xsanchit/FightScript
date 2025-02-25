import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/agent'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json({ error: 'No wallet provided' }, { status: 400 })
    }

    await dbConnect()
    const agents = await Agent.find({ user: wallet })
      .select('name category description winRate matchesPlayed matchesWon status')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(agents)
  } catch (error) {
    console.error('Failed to fetch agents:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const walletAddress = await getWalletAddress()
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await dbConnect()

    const agent = await Agent.create({
      ...body,
      user: walletAddress
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Failed to create agent:', error)
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
} 