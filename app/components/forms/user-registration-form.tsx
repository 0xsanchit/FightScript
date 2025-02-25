"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Helper function to generate random data
function generateRandomData(walletAddress: string) {
  // Random agent data
  const agentData = {
    user: walletAddress,
    name: `Agent-${Math.random().toString(36).substring(7)}`,
    category: ['chess', 'strategy', 'trading', 'other'][Math.floor(Math.random() * 4)],
    description: 'Auto-generated test agent',
    status: 'under_review',
    winRate: Math.floor(Math.random() * 100),
    matchesPlayed: Math.floor(Math.random() * 50),
    matchesWon: Math.floor(Math.random() * 25),
    sourceCode: 'https://github.com/example/agent'
  }

  // Random activity data
  const activityData = {
    user: walletAddress,
    type: 'agent_created',
    description: 'Created first agent',
    metadata: { agentName: agentData.name }
  }

  // Random user stats
  const userStats = {
    totalAgents: 1,
    competitionsWon: Math.floor(Math.random() * 5),
    tokensEarned: Math.floor(Math.random() * 1000),
    winRate: Math.floor(Math.random() * 100),
    totalEarnings: Math.floor(Math.random() * 10000)
  }

  return { agentData, activityData, userStats }
}

export function UserRegistrationForm() {
  const { publicKey } = useWallet()
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profileImage: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) return

    try {
      const walletAddress = publicKey.toString()
      const { agentData, activityData, userStats } = generateRandomData(walletAddress)

      // Create user profile with stats
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          ...formData,
          stats: userStats,
          totalEarnings: userStats.totalEarnings
        }),
      })

      if (!userResponse.ok) throw new Error('Failed to create user')

      // Create random agent
      const agentResponse = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      })

      if (!agentResponse.ok) throw new Error('Failed to create agent')

      // Create activity
      const activityResponse = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      })

      if (!activityResponse.ok) throw new Error('Failed to create activity')

      alert('Profile created successfully with sample data!')
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Error creating profile. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          maxLength={500}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Profile Image URL</label>
        <Input
          type="url"
          value={formData.profileImage}
          onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full">
        Create Profile with Sample Data
      </Button>
    </form>
  )
} 