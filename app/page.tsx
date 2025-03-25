"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import { CTA } from "@/components/cta"
import Footer from "@/components/footer"
import { Suspense } from "react"
import { LoadingState } from "@/components/ui/loading-state"
import { useWallet } from "@solana/wallet-adapter-react"
import { UserOnboardingModal } from "./components/user-onboarding-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  const { publicKey } = useWallet()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    async function checkUser() {
      if (!publicKey) return

      try {
        const response = await fetch(`/api/users?wallet=${publicKey.toString()}`)
        if (response.status === 404) {
          setIsNewUser(true)
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }

    checkUser()
  }, [publicKey])

  return (
    <div className="relative min-h-screen">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <section className="py-20 bg-background/60 backdrop-blur-sm">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Active Competitions</h2>
              <div className="max-w-6xl mx-auto">
                <Suspense fallback={<LoadingState />}>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Chess AI Competition</CardTitle>
                        <CardDescription>Compete with your AI chess agent against others</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Build and train your AI agent to play chess. Compete against other agents and climb the leaderboard.
                        </p>
                        <Link href="/competitions/chess">
                          <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                            Participate Now
                          </button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </Suspense>
              </div>
            </div>
          </section>
          <CTA />
        </main>
        <Footer />
      </div>

      {isNewUser && (
        <UserOnboardingModal 
          isOpen={showOnboarding} 
          onClose={() => {
            setShowOnboarding(false)
            setIsNewUser(false)
          }} 
        />
      )}
    </div>
  )
}

