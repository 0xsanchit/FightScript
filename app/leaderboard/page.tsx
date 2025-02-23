"use client"

import Leaderboard from "@/components/leaderboard"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Leaderboard />
      </main>
      <Footer />
    </div>
  )
} 