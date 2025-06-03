import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey, TransactionInstruction,sendAndConfirmTransaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import React from 'react';

export function DashboardTransactions() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction,wallet } = useWallet();

  const onClick = async () => {
    if (!publicKey || !signTransaction) throw new WalletNotConnectedError();

    try {
      // Mint address of the token you want to transfer
      const mint = new PublicKey("mntiweULKjN25579sJGfqFyvi31sriTzCX8Rhod3kQh");
      
      // Destination wallet (replace with the actual recipient)
      const destWallet = new PublicKey("BipBKk7Mhry6KwpdDxM7gFkr5dEYsB6rdBrCvGwuTFbD");
      
      // Amount to transfer (in token decimals, e.g., 1000 = 1.000 tokens if decimals=3)
      const amount = 1000000000;

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
      console.log("Transaction confirmed!");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <button onClick={onClick} disabled={!publicKey}>
      Send Tokens in One Transaction
    </button>
  );
}