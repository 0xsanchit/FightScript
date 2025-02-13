import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "./WalletConnect"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Leaderboard } from "./Leaderboard"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              co3pe
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-8">
                <Link href="/games" className="text-sm text-gray-300 hover:text-white">
                  Games
                </Link>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white">
                  About
                </Link>
                <Link href="/community" className="text-sm text-gray-300 hover:text-white">
                  Community
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Leaderboard</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <Leaderboard />
              </DialogContent>
            </Dialog>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  )
}

