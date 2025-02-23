"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/user-context"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Trophy, Coins, History } from "lucide-react"
import type { Agent } from "@/types/dashboard"
import type { Activity } from "@/types/dashboard"
import { AgentsList } from "@/app/components/agents-list"
import { ActivityFeed } from "@/app/components/activity-feed"
import { LoadingState } from "@/app/components/ui/loading-state"

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser()
  const { publicKey } = useWallet()
  const [agents, setAgents] = useState<Agent[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!publicKey) return

      try {
        const [agentsRes, activitiesRes] = await Promise.all([
          fetch('/api/agents', {
            headers: { 'x-wallet-address': publicKey.toString() }
          }),
          fetch('/api/activities', {
            headers: { 'x-wallet-address': publicKey.toString() }
          })
        ])

        const [agentsData, activitiesData] = await Promise.all([
          agentsRes.json(),
          activitiesRes.json()
        ])

        setAgents(agentsData)
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
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Please connect your wallet to view your dashboard
        </p>
      </div>
    )
  }

  if (loading || userLoading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
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
                  <div className="text-2xl font-bold">{user?.stats.totalAgents || 0}</div>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitions Won</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.stats.competitionsWon || 0}</div>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tokens Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.stats.tokensEarned || 0}</div>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.stats.winRate || 0}%</div>
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
                  <AgentsList 
                    agents={agents
                      .sort((a, b) => b.winRate - a.winRate)
                      .slice(0, 3)
                    } 
                  />
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
      </main>
    </div>
  )
} 