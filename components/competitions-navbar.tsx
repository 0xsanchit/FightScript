import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Trophy } from "lucide-react"

export default function CompetitionsNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">Co3pe</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/competitions" className="transition-colors hover:text-primary">
            Competitions
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-primary">
            <Trophy className="inline-block mr-1 h-4 w-4" />
            Leaderboard
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
          <Button size="sm">Connect Wallet</Button>
        </div>
      </div>
    </header>
  )
}

