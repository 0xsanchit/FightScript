"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Trophy, Coins, History } from "lucide-react"
import type { Agent } from "@/types/dashboard"
import type { Activity } from "@/types/dashboard"
import { AgentsList } from "@/app/components/agents-list"
import { ActivityFeed } from "@/app/components/activity-feed"
import { LoadingState } from "@/app/components/ui/loading-state"
import Navbar from "@/components/navbar" // Import the Navbar
import { proxyRequest } from "@/lib/api"

interface UserStats {
  username: string;
  walletAddress: string;
  totalGames: number;
  agents: Agent[];
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [agents, setAgents] = useState<Agent[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!publicKey) return

      try {
        setLoading(true)
        const walletAddress = publicKey.toString()

        // Fetch user stats
        const statsData = await proxyRequest(`/stats?wallet=${walletAddress}`)
        setUserStats(statsData)

        // Fetch agents
        const agentsData = await proxyRequest(`/agents?wallet=${walletAddress}`)
        setAgents(agentsData)

        // Fetch activities
        const activitiesData = await proxyRequest(`/activities?wallet=${walletAddress}`)
        setActivities(activitiesData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [publicKey])

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Please connect your wallet</h2>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agents">My Agents</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.totalGames || 0}</div>
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Competitions Won</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.agents.filter(a => a.status === 'active').length || 0}</div>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tokens Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.agents.filter(a => a.status === 'active').length * 10 || 0}</div>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.agents.filter(a => a.status === 'active').length > 0 ? ((userStats?.agents.filter(a => a.status === 'active').length / userStats?.totalGames) * 100).toFixed(2) : 0}%</div>
                    <History className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityFeed activities={activities.slice(0, 5)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AgentsList agents={agents.sort((a, b) => b.wins - a.wins).slice(0, 3)} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="agents">
              <AgentsList agents={agents} showActions />
            </TabsContent>

            <TabsContent value="activities">
              <ActivityFeed activities={activities} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}