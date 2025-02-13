"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const competitions = [
  {
    title: "Chess",
    description: "Challenge our AI in strategic chess battles. Test your skills against an adaptive opponent!",
    emoji: "♟️",
    href: "/games/chess",
    isActive: true
  },
  {
    title: "Memory Game",
    description: "Match pairs and compete against the clock in this AI-powered memory challenge.",
    emoji: "🧠",
    href: "/games/memory",
    isActive: false
  },
  {
    title: "Typing Speed",
    description: "Race against AI in this high-speed typing challenge. Test your accuracy and speed!",
    emoji: "⌨️",
    href: "/games/typing",
    isActive: false
  },
  {
    title: "Reaction Time",
    description: "Put your reflexes to the test! Can you beat the AI's lightning-fast reactions?",
    emoji: "⚡",
    href: "/games/reaction",
    isActive: false
  }
]

export function Competitions() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          AI Competitions
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Challenge yourself against our AI in various competitions. More games coming soon!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {competitions.map((competition, index) => (
          <Card key={index} className="relative group hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{competition.emoji}</span>
                  <div>
                    <CardTitle className="text-2xl">
                      {competition.title}
                    </CardTitle>
                    <CardDescription>{competition.description}</CardDescription>
                  </div>
                </div>
                {!competition.isActive && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                    Coming Soon
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {competition.isActive ? (
                <Link href={competition.href}>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Enter Arena
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full opacity-50 cursor-not-allowed">
                  Coming Soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
} 