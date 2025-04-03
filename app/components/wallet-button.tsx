"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'

interface Wallet {
  adapter: {
    name: string;
  };
}

export function WalletButton() {
  const { connected, select, wallets, disconnect } = useWallet()

  useEffect(() => {
    if (connected) {
      console.log('Wallet connected')
    }
  }, [connected])

  return (
    <div className="flex items-center gap-4">
      {connected ? (
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Disconnect
        </button>
      ) : (
        <div className="relative group">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect Wallet
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
            {wallets.map((wallet: Wallet) => (
              <button
                key={wallet.adapter.name}
                onClick={() => select(wallet.adapter.name)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {wallet.adapter.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 