import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log('Proxying GET request to Express server:', `${API_BASE_URL}/users/${id}`)
    
    const response = await fetch(`${API_BASE_URL}/users/${id}`)
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