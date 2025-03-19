import { NextResponse } from 'next/server'
import { proxyRequest } from '@/lib/api'

export async function GET(request: Request) {
  try {
    // Get wallet from query parameter instead of cookie
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json({ error: 'No wallet provided' }, { status: 400 })
    }

    const data = await proxyRequest(`/users?wallet=${wallet}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await proxyRequest('/users', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    )
  }
} 