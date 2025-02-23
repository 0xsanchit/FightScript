"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"

export function CTA() {
  const { publicKey } = useWallet()

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Connect your wallet to start competing in AI competitions and earn rewards.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            {publicKey ? (
              <Link href="/competitions">
                <Button className="gap-2">
                  View Competitions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <WalletMultiButton 
                className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            )}
            <Link href="/about">
              <Button variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

