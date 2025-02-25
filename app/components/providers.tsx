"use client"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo } from "react"

// Import wallet adapter CSS
require("@solana/wallet-adapter-react-ui/styles.css")

export function Providers({ children }: { children: React.ReactNode }) {
  // Set network to devnet
  const network = WalletAdapterNetwork.Devnet

  // Get RPC endpoint for the network
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // Initialize wallets
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
} 