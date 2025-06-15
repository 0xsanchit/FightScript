// src/routes/upload.ts
import express from "express";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { drive_v3 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { ChessEngine } from '../engine/chess-engine'
import Agent from '../models/Agent';
import User from '../models/User';

import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const router = express.Router()

router.post("/deposit", async (req, res) => {
try {
    const {wallet,signature} = req.body;
    const transaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    });
    
    if (transaction && transaction.meta && transaction.meta.preTokenBalances && transaction.meta.postTokenBalances) {
        let pre_balances : any[]= transaction.meta.preTokenBalances ;
        let post_balances : any[]= transaction.meta.postTokenBalances;
        const findBalance = (balances: any[]) =>
            balances.find(
            (b) =>
                b?.owner === 'BipBKk7Mhry6KwpdDxM7gFkr5dEYsB6rdBrCvGwuTFbD' &&
                b?.mint === 'mntiweULKjN25579sJGfqFyvi31sriTzCX8Rhod3kQh' &&
                b?.uiTokenAmount?.amount !== undefined
            );
            const pre = findBalance(pre_balances);
            const post = findBalance(post_balances);
            if (pre && post) {
                const preAmount = parseInt(pre.uiTokenAmount.amount);
                const postAmount = parseInt(post.uiTokenAmount.amount);
                const depositAmount = postAmount - preAmount;
                const user = await User.findOneAndUpdate({walletAddress:wallet},
                    {
                      $inc:{
                        balance:depositAmount
                      },
                      $push:{
                        deposits:signature
                      }
                    });
                console.log(user);

                return res.json({
                    depositAmount: depositAmount
                })
            }
            console.log("Reaching");
    }
    console.log("Transaction not found");
    return res.status(500).json({ 
        error: 'Failed to deposit.',
      })
} catch (error: any) {
  return res.status(500).json({ 
    error: 'Failed to deposit',
  })
}
})

export default router;
