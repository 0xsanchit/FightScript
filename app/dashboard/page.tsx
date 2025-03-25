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
import Navbar from "@/components/navbar"
import { fetchUserStats } from "../lib/api"

interface UserStats {
  username: string;
  walletAddress: string;
  profileImage: string;
  bio: string;
  stats: {
    totalAgents: number;
    competitionsWon: number;
    tokensEarned: number;
    winRate: number;
    totalGames: number;
  };
  totalEarnings: number;
  agents: Agent[];
  activities: Activity[];
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!publicKey) {
        console.log("Wallet not connected");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching dashboard data for wallet:", publicKey.toString());
        setLoading(true);
        setError(null);
        const walletAddress = publicKey.toString();
        const statsData = await fetchUserStats(walletAddress);
        console.log("Received stats data:", statsData);
        setUserStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Please connect your wallet</h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-600">{error}</h2>
            <p className="mt-4 text-gray-600">Please try refreshing the page or connecting your wallet again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {userStats?.username ? userStats.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{userStats?.username || 'Anonymous'}</h1>
              <p className="text-gray-600">{userStats?.walletAddress || 'No wallet connected'}</p>
              {userStats?.bio && (
                <p className="text-gray-500 mt-2">{userStats.bio}</p>
              )}
            </div>
          </div>
          
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
                    <div className="text-2xl font-bold">{userStats?.stats.totalAgents || 0}</div>
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Competitions Won</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.stats.competitionsWon || 0}</div>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tokens Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.stats.tokensEarned || 0}</div>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.stats.winRate || 0}%</div>
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
                    <ActivityFeed activities={userStats?.activities || []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AgentsList 
                      agents={userStats?.agents 
                        ? [...userStats.agents].sort((a, b) => (b.matchesWon || 0) - (a.matchesWon || 0)).slice(0, 3)
                        : []} 
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="agents">
              <AgentsList agents={userStats?.agents || []} showActions />
            </TabsContent>

            <TabsContent value="activities">
              <ActivityFeed activities={userStats?.activities || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}