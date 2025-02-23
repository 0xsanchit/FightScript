export interface Agent {
  _id: string
  name: string
  category: 'chess' | 'strategy' | 'trading' | 'other'
  description: string
  status: 'active' | 'under_review' | 'rejected' | 'archived'
  winRate: number
  matchesPlayed: number
  matchesWon: number
  createdAt: string
  lastUpdated: string
  sourceCode: string
  competitions: string[]
}

export interface Activity {
  _id: string
  user: string
  type: string
  description: string
  metadata?: any
  timestamp: Date
}

export interface UserStats {
  totalAgents: number
  competitionsWon: number
  tokensEarned: number
  winRate: number
}

export interface Competition {
  _id: string
  title: string
  description: string
  prize: number
  status: 'upcoming' | 'active' | 'completed'
  startDate?: Date
  endDate?: Date
}

export interface User {
  _id: string
  walletAddress: string
  username: string
  bio?: string
  githubHandle?: string
  discordHandle?: string
  expertise: 'beginner' | 'intermediate' | 'expert'
  createdAt: Date
} 