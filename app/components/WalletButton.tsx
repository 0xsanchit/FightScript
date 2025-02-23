"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function WalletButton() {
  const { publicKey, disconnect } = useWallet()

  if (publicKey) {
    return (
      <Button 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => disconnect()}
      >
        <Wallet className="h-4 w-4" />
        {`${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`}
      </Button>
    )
  }

  return (
    <WalletMultiButton
      className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </WalletMultiButton>
  )
} 