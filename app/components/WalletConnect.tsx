"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Icons } from "@/components/ui/icons"

const wallets = [
  {
    name: "MetaMask",
    icon: "metamask",
    description: "Connect to your MetaMask wallet",
    downloadUrl: "https://metamask.io/download/",
  },
  {
    name: "Phantom",
    icon: "phantom",
    description: "Connect to your Phantom wallet",
    downloadUrl: "https://phantom.app/download",
  },
]

export function WalletConnect() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="flex items-center justify-start gap-4 h-16"
              onClick={() => window.open(wallet.downloadUrl, "_blank")}
            >
              <Icons[wallet.icon as keyof typeof Icons] className="h-8 w-8" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">{wallet.name}</span>
                <span className="text-sm text-muted-foreground">
                  {wallet.description}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 