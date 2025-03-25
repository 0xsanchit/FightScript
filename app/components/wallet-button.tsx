"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function WalletButton() {
  const { publicKey, connecting, disconnect, select, wallet } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  useEffect(() => {
    if (connecting) {
      setIsConnecting(true)
    } else {
      setIsConnecting(false)
    }
  }, [connecting])

  const handleConnect = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error("Maximum connection attempts reached. Please try again later.")
      return
    }

    try {
      setIsConnecting(true)
      setRetryCount(prev => prev + 1)
      
      if (!wallet) {
        toast.error("No wallet selected")
        return
      }

      await select(wallet.adapter.name)
      toast.success("Wallet connected successfully")
    } catch (error) {
      console.error("Connection error:", error)
      toast.error("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsConnecting(true)
      await disconnect()
      setRetryCount(0)
      toast.success("Wallet disconnected successfully")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      toast.error("Failed to disconnect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {publicKey ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </span>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={isConnecting}
          >
            {isConnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      ) : (
        <WalletMultiButton 
          className="!bg-primary hover:!bg-primary/90"
          onClick={handleConnect}
        />
      )}
    </div>
  )
} 