import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://co3pe.onrender.com'
  : 'http://localhost:5000'

export async function GET(
  request: Request,
  { params }: { params: { wallet: string } }
) {
  try {
    const wallet = params.wallet
    
    console.log('Next.js API Route: Fetching user with wallet:', wallet)
    console.log('Backend URL:', BACKEND_URL)
    
    const response = await fetch(`${BACKEND_URL}/api/users/${wallet}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('Backend response status:', response.status)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('Backend error:', error)
      return NextResponse.json(
        { error: error.error || 'Failed to fetch user data' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Next.js API route:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 