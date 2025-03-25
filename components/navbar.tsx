"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Trophy } from "lucide-react"
import { WalletButton } from "./wallet-button"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const navigationItems = [
  { href: "/competitions", label: "Competitions" },
  { href: "/about", label: "About Us" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  // Remove or update any staking-related links
]

export default function Navbar() {
  const { publicKey } = useWallet()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">Co3pe</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-primary flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
          <Link href="https://0xmuon.github.io/co3pe-docs/" target="_blank" rel="noopener noreferrer" className="text-black">
            Docs
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}