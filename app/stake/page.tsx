'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useWallet } from '@solana/wallet-adapter-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Label } from '@/components/ui/label'
// import { Slider } from '@/components/ui/slider'
// import { ArrowRight, TrendingUp, Clock, Coins } from 'lucide-react'
// import { toast } from 'react-hot-toast'
export default function StakePage() {

    return(
        <div></div>
    )
}


// export default function StakePage() {
//   const { publicKey, signTransaction } = useWallet()
//   const [amount, setAmount] = useState<number>(100)
//   const [duration, setDuration] = useState<number>(30) // days
//   const [isStaking, setIsStaking] = useState<boolean>(false)
//   const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState<boolean>(true)
//   const [userBalance, setUserBalance] = useState<number>(0)
//   const [maxStakeAmount, setMaxStakeAmount] = useState<number>(0)
//   const [isBuying, setIsBuying] = useState<boolean>(false)
//   const [solBalance, setSolBalance] = useState<number>(0)
//   const [pricePerToken, setPricePerToken] = useState<number>(0.1) // 0.1 SOL per CO3PE token
//   const [isSwapping, setIsSwapping] = useState<boolean>(false)
//   const [swapAmount, setSwapAmount] = useState<number>(0)
//   const [swapDirection, setSwapDirection] = useState<'buy' | 'sell'>('buy')
//   const [tokenSwap, setTokenSwap] = useState<TokenSwap | null>(null)
//   const [requestCount, setRequestCount] = useState<number>(0)
  
//   const isWalletConnected = !!publicKey;

//   return (
//     <div className="container max-w-4xl py-12">
//       <h1 className="mb-8 text-4xl font-bold">FST Token Swap</h1>
      
//       {isLoading && (
//         <div className="mb-8 text-center">
//           <p>Loading token information...</p>
//         </div>
//       )}

//       {error && (
//         <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-400">
//           <p>{error}</p>
//           {error.includes('429') && (
//             <p className="mt-2 text-sm">
//               The Solana RPC endpoint is rate limiting our requests. Please try again in a few moments.
//             </p>
//           )}
//           {error.includes('Failed to connect') && (
//             <p className="mt-2 text-sm">
//               There seems to be an issue connecting to the Solana network. This could be due to:
//               <ul className="list-disc ml-5 mt-2">
//                 <li>Network connectivity issues</li>
//                 <li>Rate limiting from the RPC provider</li>
//                 <li>Temporary outage of the Solana devnet</li>
//               </ul>
//               Please try again in a few moments.
//             </p>
//           )}
//           {(error.includes('account') || error.includes('Account')) && (
//             <p className="mt-2 text-sm">
//               There was an issue with your token account. If you're new to FST tokens, 
//               you may need to receive some tokens first to create your account.
//             </p>
//           )}
//           <button 
//             className="mt-3 px-4 py-2 text-sm font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-200 dark:hover:bg-red-700/30"
//             onClick={() => setError(null)}
//           >
//             Dismiss
//           </button>
//         </div>
//       )}
      
//       {tokenMetadata && (
//         <Card className="mb-8">
//           <CardHeader>
//             <div className="flex items-center gap-4">
//               <div>
//                 <CardTitle>{tokenMetadata.name}</CardTitle>
//                 <CardDescription>Your Balance: {userBalance} {tokenMetadata.symbol}</CardDescription>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Total Supply</span>
//                   <span className="font-medium">{tokenMetadata.supply} {tokenMetadata.symbol}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Swap Fee</span>
//                   <span className="font-medium">0.3%</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Your Balance</span>
//                   <span className="font-medium">{userBalance} {tokenMetadata.symbol}</span>
//                 </div>
//                 {/* {SWAP_PROGRAM_OWNER_FEE_ADDRESS && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Program Owner Fee Address</span>
//                     <span className="font-mono text-sm break-all">{SWAP_PROGRAM_OWNER_FEE_ADDRESS.toBase58()}</span>
//                   </div>
//                 )} */}
//                 {/* {SWAP_HOST_FEE_ADDRESS && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Host Fee Address</span>
//                     <span className="font-mono text-sm break-all">{SWAP_HOST_FEE_ADDRESS.toBase58()}</span>
//                   </div>
//                 )} */}
//               </div>
//               <div className="space-y-2">
//                 {/* <div className="flex justify-between">
//                   <span className="text-muted-foreground">Mint Address</span>
//                   <span className="font-mono text-sm break-all">{MINT_ADDRESS}</span>
//                 </div> */}
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Mint Authority</span>
//                   <span className="font-mono text-sm break-all">{tokenMetadata.mintAuthority || 'None'}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Freeze Authority</span>
//                   <span className="font-mono text-sm break-all">{tokenMetadata.freezeAuthority || 'None'}</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
      
//       <div className="grid gap-8 md:grid-cols-3">
//         <Card className="md:col-span-2">
//           <CardHeader>
//             <CardTitle>Swap FST Tokens</CardTitle>
//             <CardDescription>
//               Swap FST tokens with SOL. Current fee: 0.3%
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="space-y-2">
//               <Label>Swap Direction</Label>
//               <div className="flex gap-4">
//                 <Button
//                   variant={swapDirection === 'buy' ? 'default' : 'outline'}
//                   onClick={() => setSwapDirection('buy')}
//                 >
//                   Buy FST
//                 </Button>
//                 <Button
//                   variant={swapDirection === 'sell' ? 'default' : 'outline'}
//                   onClick={() => setSwapDirection('sell')}
//                 >
//                   Sell FST
//                 </Button>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="amount">Amount to {swapDirection === 'buy' ? 'Buy' : 'Sell'}</Label>
//               <div className="flex items-center gap-2">
//                 <Input
//                   id="amount"
//                   type="number"
//                   min="0"
//                   step="0.000000001"
//                   value={swapAmount}
//                   onChange={(e) => {
//                     const value = parseFloat(e.target.value)
//                     if (!isNaN(value) && value >= 0) {
//                       setSwapAmount(value)
//                     }
//                   }}
//                   disabled={!isWalletConnected || isSwapping}
//                   className="flex-1"
//                 />
//                 <span className="font-medium">FST</span>
//               </div>
//             </div>
//           </CardContent>
//           <CardFooter>
//             <Button 
//               className="w-full" 
//               disabled={!isWalletConnected || isSwapping || swapAmount <= 0}
//             >
//               {isSwapping ? 'Processing...' : `Swap ${swapDirection === 'buy' ? 'Buy' : 'Sell'} Tokens`}
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           </CardFooter>
//         </Card>
        
//         <div className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Swap Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Direction</span>
//                 <span className="font-medium">{swapDirection === 'buy' ? 'Buy FST' : 'Sell FST'}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Amount</span>
//                 <span className="font-medium">{swapAmount} FST</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Fee</span>
//                 <span className="font-medium">0.3%</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Your Balance</span>
//                 <span className="font-medium">{userBalance} FST</span>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Benefits</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-3">
//                 <li className="flex items-center gap-2">
//                   <TrendingUp className="h-5 w-5 text-green-500" />
//                   <span>Instant token swaps</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Clock className="h-5 w-5 text-blue-500" />
//                   <span>Low fees (0.3%)</span>
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <Coins className="h-5 w-5 text-amber-500" />
//                   <span>Liquidity provided by the community</span>
//                 </li>
//               </ul>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
      
//       <div className="mt-12 rounded-lg bg-slate-50 p-6 dark:bg-slate-900">
//         <h2 className="mb-4 text-2xl font-bold">About FST Token Swap</h2>
//         <p className="mb-4">
//           The FST token swap allows you to trade FST tokens with SOL instantly. The swap uses a constant product curve to determine prices, ensuring fair and efficient trading.
//         </p>
//         <p>
//           The swap fee is 0.3% of the transaction amount, which is used to reward liquidity providers and maintain the pool. The more liquidity in the pool, the better the trading experience for everyone.
//         </p>
//       </div>
//     </div>
//   )
// } 