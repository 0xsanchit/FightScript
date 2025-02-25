import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Activity from '@/models/activity'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json({ error: 'No wallet provided' }, { status: 400 })
    }

    await dbConnect()
    const activities = await Activity.find({ user: wallet })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean()

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// Internal function to create activities (not exposed as API)
export async function createActivity(data: {
  user: string
  type: string
  description: string
  metadata?: any
}) {
  try {
    await dbConnect()
    const activity = await Activity.create(data)
    return activity
  } catch (error) {
    console.error('Failed to create activity:', error)
    throw error
  }
} 