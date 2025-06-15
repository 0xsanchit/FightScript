"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/upload.ts
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const web3_js_1 = require("@solana/web3.js");
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"), "confirmed");
const router = express_1.default.Router();
router.post("/deposit", async (req, res) => {
    try {
        const { wallet, signature } = req.body;
        const transaction = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        });
        if (transaction && transaction.meta && transaction.meta.preTokenBalances && transaction.meta.postTokenBalances) {
            let pre_balances = transaction.meta.preTokenBalances;
            let post_balances = transaction.meta.postTokenBalances;
            const findBalance = (balances) => balances.find((b) => b?.owner === 'BipBKk7Mhry6KwpdDxM7gFkr5dEYsB6rdBrCvGwuTFbD' &&
                b?.mint === 'mntiweULKjN25579sJGfqFyvi31sriTzCX8Rhod3kQh' &&
                b?.uiTokenAmount?.amount !== undefined);
            const pre = findBalance(pre_balances);
            const post = findBalance(post_balances);
            if (pre && post) {
                const preAmount = parseInt(pre.uiTokenAmount.amount);
                const postAmount = parseInt(post.uiTokenAmount.amount);
                const depositAmount = postAmount - preAmount;
                const user = await User_1.default.findOneAndUpdate({ walletAddress: wallet }, {
                    $inc: {
                        balance: depositAmount
                    },
                    $push: {
                        deposits: signature
                    }
                });
                console.log(user);
                return res.json({
                    depositAmount: depositAmount
                });
            }
            console.log("Reaching");
        }
        console.log("Transaction not found");
        return res.status(500).json({
            error: 'Failed to deposit.',
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to deposit',
        });
    }
});
exports.default = router;
