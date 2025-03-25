"use client"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo } from "react"
import { ThemeProvider } from "next-themes"

// Import wallet adapter CSS
require("@solana/wallet-adapter-react-ui/styles.css")

export function Providers({ children }: { children: React.ReactNode }) {
  // Set network to devnet
  const network = WalletAdapterNetwork.Devnet

  // Get RPC endpoint for the network
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // Initialize wallets with proper configuration
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({
        appName: "CO3PE",
        network: WalletAdapterNetwork.Devnet,
        // Add additional configuration options
        timeout: 30000, // 30 seconds timeout
        // Disable auto-connect to prevent connection issues
        autoConnect: false,
      }),
      new SolflareWalletAdapter({
        network: WalletAdapterNetwork.Devnet,
        timeout: 30000,
        autoConnect: false,
      }),
    ],
    []
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider 
          wallets={wallets} 
          autoConnect={false}
          onError={(error) => {
            console.error("Wallet error:", error)
            // Add more detailed error logging
            if (error.name === 'WalletConnectionError') {
              console.error('Connection error details:', {
                message: error.message,
                stack: error.stack,
                wallet: error.wallet?.name
              })
            }
          }}
        >
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  )
} 