"use client"

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react'
import { Menu, X, ChevronDown, HardDriveDownload, HardDriveUpload } from 'lucide-react'
import { Transaction, PublicKey, TransactionInstruction,sendAndConfirmTransaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import { ToastContainer, toast } from 'react-toastify';
import { Button } from "@/components/ui/button"



interface Wallet {
  adapter: {
    name: string;
  };
}

function floatStringToBigIntScaled(floatStr: string): bigint {
  let [integerPart, fractionalPart = ""] = floatStr.split(".");

  // Normalize fractional part to 9 digits (pad with zeros or truncate)
  fractionalPart = (fractionalPart + "000000000").slice(0, 9);

  const integerBigInt = BigInt(integerPart);
  const fractionalBigInt = BigInt(fractionalPart);

  // Scale and combine both parts
  const result = integerBigInt * 1_000_000_000n + fractionalBigInt;

  return result;
}

export function WalletButton() {
  const { connected, select,wallets,wallet, disconnect, publicKey,sendTransaction,signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [depositVal, setDepositVal] = useState<string>('');
  const [modalOpen,setModalOpen] = useState(false);

  const transfer = async () => {
    if (!publicKey || !signTransaction) throw new WalletNotConnectedError();

    try {
      // Mint address of the token you want to transfer
      const mint = new PublicKey("mntiweULKjN25579sJGfqFyvi31sriTzCX8Rhod3kQh");
      
      // Destination wallet (replace with the actual recipient)
      const destWallet = new PublicKey("BipBKk7Mhry6KwpdDxM7gFkr5dEYsB6rdBrCvGwuTFbD");
      
      // Amount to transfer (in token decimals, e.g., 1000 = 1.000 tokens if decimals=3)
      const amount = floatStringToBigIntScaled(depositVal);

      // Get or create the sender's ATA
      const senderATA = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID 
      );

      // Get or create the recipient's ATA
      const recipientATA = await getAssociatedTokenAddress(
        mint,
        destWallet,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      console.log(senderATA.toString());
      console.log(recipientATA.toString());
      // Check if recipient ATA exists (if not, we need to create it)
      const senderAccountInfo = await connection.getAccountInfo(senderATA);
      const recipientAccountInfo = await connection.getAccountInfo(recipientATA);
      console.log(senderAccountInfo);
      console.log(recipientAccountInfo);
      const instructions: TransactionInstruction[] = [];

      if(!senderAccountInfo)
      {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey, // Payer
            senderATA, // ATA address
            publicKey, // Owner
            mint, // Mint
            TOKEN_2022_PROGRAM_ID
          )
        );
      }

      // If recipient ATA doesn't exist, add a creation instruction
      if (!recipientAccountInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey, // Payer
            recipientATA, // ATA address
            destWallet, // Owner
            mint, // Mint
            TOKEN_2022_PROGRAM_ID
          )
        );
      }

      // Add the token transfer instruction
      instructions.push(
        createTransferInstruction(
          senderATA, // Source ATA
          recipientATA, // Destination ATA
          publicKey, // Owner of sender ATA
          amount, // Amount (in token units)
          [], // Signers (empty for now)
          TOKEN_2022_PROGRAM_ID,
        )
      );

      // Create and send the transaction
      const transaction = new Transaction().add(...instructions);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

      // Sign and send
      const signedTx = await signTransaction(transaction);
      const txSignature = await connection.sendRawTransaction(signedTx.serialize());

      console.log("Transaction sent:", txSignature);
      await connection.confirmTransaction(txSignature);

      // Use the direct backend URL
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'signature': txSignature,
          'wallet': publicKey.toString(),
        }),
      });

      if (!uploadResponse.ok) {
        toast("Deposit Failed! If any tokens have been deducted, please contact support");
      }
      else
      {
        toast("Deposit Successful! Please refresh in 5-10mins for updated balance");
      }

    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  // Fetch balance on connect
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {

        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${publicKey.toString()}`);
        const userData = await userResponse.json();
        console.log(userData);
        setBalance(userData.balance/1000000000);
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
      <ToastContainer />
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-2 text-white bg-gray-800 rounded-md hover:bg-gray-700"
      >
        {isDropdownOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      { modalOpen &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all" 
              >

            <input
              id="depositVal"
              type="number"
              value={depositVal}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setDepositVal(e.target.value);
              }}
              placeholder="Enter Amount..."
            />                <Button onClick={transfer}>
                  Deposit
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>
                  Cancel 
                  </Button>
      </div>
      </div>
      }

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-black rounded-md shadow-lg p-4 z-10 space-y-3 ">
          <div className="text-sm text-white break-words">
            <strong>Address:</strong><br />
            {publicKey.toString()}
          </div>
          <div className="text-sm text-white w-100% ">
            <strong>Balance:</strong> ◎ {balance?.toFixed(2) ?? '0.00'}
          </div><div className='flex gap-4'>
          <button
            onClick={() => setModalOpen(true)}
            className="w-100% text-sm text-white bg-gray-800 rounded-md px-2 py-2 hover:bg-gray-600 flex gap-2"
          >
            <HardDriveUpload className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={() => {
              //Put what the thing should do on Withdraw button click XD
            }}
            className="w-40% text-sm text-white bg-gray-800 rounded-md px-2 py-2 hover:bg-gray-600 flex gap-2"
          >
            <HardDriveDownload className="w-4 h-4" />
            withdraw
          </button>
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
        </div>
      )}
    </div>
  )
}
