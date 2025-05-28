"use client"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
import { Navbar } from "@/components/navbar"
import { fetchUserStats, fetchUser } from "../lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserOnboardingModal } from "@/app/components/user-onboarding-modal"
import Footer from "@/components/footer"

const links = [
  { name: 'Chess', href: '#Chess' },
];


export default function DocPage() {

  return (

    <div className="min-h-screen bg-background">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>
      <div className="relative z-10">


        <div className="max-w-auto mx-auto">
          <Navbar />

          <main className="container mx-auto px-4 py-12 flex">
            <aside className="w-64 hidden md:block h-screen sticky top-14 bg-[#1E1F2F] rounded-2xl text-white shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Docs Navigation</h2>
              <nav className="space-y-4">
                {links.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block px-2 py-1 rounded hover:bg-[#2A2B3C] transition"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg p-6 border-2 border-solid border-cyan-700 flex flex-col">
              <div className="max-w-4xl mx-auto space-y-8">
                <section id="Chess">{/* Introduction */}
                  <section>
                    <h1 className="text-4xl font-bold mb-4">♟️ Create & Upload Your Chess Bot to Battle AggressiveBot</h1>
                    <p className="text-gray-300">
                      Welcome to FightScript! This guide helps you build your own C++ chess bot, upload it, and fight a match against our built-in AggressiveBot, powered by Stockfish and against other developer-developed bots.
                    </p>
                  </section>

                  {/* Requirements */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">✅ What You Need</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Just Enthusiasm :)

                      </li>
                      
                    </ul>
                  </section>

                  {/* Sample Code */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">💻 Sample Bot Code</h2>
                    <p className="text-gray-300 mb-4">
                      This example bot picks a basic random move:
                    </p>
                    <pre className="bg-gray-800 p-4 rounded overflow-x-auto text-sm">
                      <SyntaxHighlighter language="cpp" style={vscDarkPlus} wrapLines={true}>
                        {`import chess
from typing import Optional
import random

class ChessAgent:
    def __init__(self):
        self.name = "Agent"
        # Initialize default parameters 
        pass

    def make_move(self, board: chess.Board, time_limit: float) -> chess.Move:
        """
        Make a move based on the current board state.
        Handles timeouts and returns None if no move can be made.
        """
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None
        return random.choice(legal_moves)`}
                      </SyntaxHighlighter>
                    </pre>
                  </section>

                  {/* Compilation Instructions */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">⚙️ How to Compile </h2>
                    <p className="text-gray-300 mb-2">
                      No compilation needed
                    </p>
                    
                  </section>

                  {/* Uploading the Bot */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">📤 Creating Your own Bot</h2>
                    <ol className="list-decimal list-inside text-gray-300 space-y-1">
                      <li>Your bot should implement a class ChessAgent which has a function play move</li>
                      <li>Please ensure the time limit per move and all dependencies should be in the same file</li>
                      <li>Just upload this python file using the Upload Bot button on the site</li>
                    </ol>
                  </section>

                  {/* Match Flow */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">🎮 Match Flow</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>The match flow happens by selecting two bots and conducting their match</li>
                      <li>The two bots are run in a secure environment with an engine</li>
                      <li>Based on the result of the match, each bot gets an updated rating</li>
                      <li>These matches happen at regular intervals or if a new bot joins the ring</li>
                    </ul>
                  </section>

                  {/* Rules & Tips */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">⚠️ Rules & Tips</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Your bot must not try to execute any malicious code</li>
                      <li>Take care of the time limit per move</li>
                      <li>Avoid memory leaks or spawning new threads</li>
                      <li>You can build advanced bots with:
                        <ul className="list-disc list-inside ml-6">
                          <li>Minimax</li>
                          <li>Evaluation functions</li>
                          <li>Any library can be used if everything is present in a single file</li>
                        </ul>
                      </li>
                    </ul>
                  </section>
                </section>

              </div>
            </div>

          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}