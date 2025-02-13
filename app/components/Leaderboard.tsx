"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type GameType = "chess" | "memory" | "typing" | "reaction"

interface LeaderboardEntry {
  username: string
  score: number
  date: string
  rank: number
}

const games = [
  { id: "chess", name: "Chess", emoji: "♟️", isActive: true },
  { id: "memory", name: "Memory", emoji: "🧠", isActive: false },
  { id: "typing", name: "Typing", emoji: "⌨️", isActive: false },
  { id: "reaction", name: "Reaction", emoji: "⚡", isActive: false }
] as const

export function Leaderboard() {
  // This would be replaced with actual data from your backend
  const mockLeaderboard: Record<GameType, LeaderboardEntry[]> = {
    chess: [
      { username: "GrandMaster1", score: 2400, date: "2024-03-20", rank: 1 },
      { username: "ChessWizard", score: 2350, date: "2024-03-19", rank: 2 },
      { username: "QueenMaster", score: 2300, date: "2024-03-18", rank: 3 },
    ],
    memory: [],
    typing: [],
    reaction: []
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Global Leaderboard</CardTitle>
        <CardDescription>Top players across all AI competitions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chess" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            {games.map((game) => (
              <TabsTrigger
                key={game.id}
                value={game.id}
                disabled={!game.isActive}
                className="flex items-center gap-2"
              >
                <span>{game.emoji}</span>
                <span>{game.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {games.map((game) => (
            <TabsContent key={game.id} value={game.id}>
              <div className="space-y-4">
                {game.isActive ? (
                  mockLeaderboard[game.id as GameType].length > 0 ? (
                    mockLeaderboard[game.id as GameType].map((entry) => (
                      <div
                        key={entry.rank}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold">#{entry.rank}</span>
                          <span className="font-medium">{entry.username}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{entry.score}</span>
                          <span className="text-sm text-muted-foreground">
                            {entry.date}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No rankings available yet. Be the first to compete!
                    </p>
                  )
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Coming soon! Rankings will be available when the game launches.
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
} 