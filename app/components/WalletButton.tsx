"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'

interface Wallet {
  adapter: {
    name: string;
  };
}

export function WalletButton() {
  const { connected, select, wallets, disconnect, publicKey } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-2 text-white bg-gray-800 rounded-md hover:bg-gray-700"
      >
        {isDropdownOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg p-4 z-10 space-y-3">
          {connected ? (
            <>
              <div className="text-sm text-gray-800 break-words">
                <strong>Address:</strong><br />
                {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
              </div>
              <div className="text-sm text-gray-800">
                <strong>Balance:</strong> ◎ {balance?.toFixed(2) ?? '0.00'}
              </div>
              <button
                onClick={() => {
                  disconnect()
                  setIsDropdownOpen(false)
                }}
                className="w-full text-sm text-white bg-red-600 rounded-md px-4 py-2 hover:bg-red-700"
              >
                Disconnect
              </button>
            </>
          ) : (
            wallets.map((wallet: Wallet) => (
              <button
                key={wallet.adapter.name}
                onClick={() => {
                  select(wallet.adapter.name)
                  setIsDropdownOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {wallet.adapter.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
