import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    console.log('Proxying GET request to Express server:', `${API_BASE_URL}/users?wallet=${wallet}`)
    
    if (!wallet) {
      return NextResponse.json({ error: 'No wallet provided' }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/users?wallet=${wallet}`)
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to proxy request to Express server:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Proxying POST request to Express server:', `${API_BASE_URL}/users`)
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to proxy request to Express server:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create user',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 