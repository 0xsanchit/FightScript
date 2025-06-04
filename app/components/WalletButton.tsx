"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

interface Wallet {
  adapter: {
    name: string;
  };
}

export function WalletButton() {
  const { connected, select, wallets, disconnect, publicKey } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)

  // Fetch balance on connect
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        // fill the code??
      }
    }
    if (connected) {      
      console.log('Wallet connected:', publicKey?.toString())
      fetchBalance()
    }
  }, [connected, publicKey])

  if (!connected) {
    // BEFORE Connecting, it will show a connect button
    return (<div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              {wallets.map((wallet: Wallet) => (
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
              ))}
            </div>
          )}
        </div>
    )
  }

  // AFTER connecting, it will show hamburger.
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-2 text-white bg-gray-800 rounded-md hover:bg-gray-700"
      >
        {isDropdownOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-black rounded-md shadow-lg p-4 z-10 space-y-3">
          <div className="text-sm text-white break-words">
            <strong>Address:</strong><br />
            {publicKey.toString()}
          </div>
          <div className="text-sm text-white w-100%">
            <strong>Balance:</strong> ◎ {balance?.toFixed(2) ?? '0.00'}
          </div>
          <button
            onClick={() => {
              //Put what the thing should do on Deposit button click XD
            }}
            className="w-40% text-sm text-white bg-gray-800 rounded-md px-4 py-2 mr-8 hover:bg-gray-600"
          >
            Deposit
          </button>
          <button
            onClick={() => {
              //Put what the thing should do on Withdraw button click XD
            }}
            className="w-40% text-sm text-white bg-gray-800 rounded-md px-4 py-2 hover:bg-gray-600"
          >
            withdraw
          </button>
          <button
            onClick={() => {
              disconnect()
              setIsDropdownOpen(false)
            }}
            className="w-full text-sm text-white bg-red-600 rounded-md px-4 py-2 hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
