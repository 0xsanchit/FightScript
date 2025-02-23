import { cookies } from 'next/headers'
import { PublicKey } from '@solana/web3.js'
import { User } from '@/types/user'
import dbConnect from './mongodb'
import UserModel from '@/models/User'

export async function getWalletAddress(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const wallet = cookieStore.get('wallet')?.value
    
    if (!wallet) return null
    
    // Validate it's a valid Solana address
    new PublicKey(wallet) // This will throw if invalid
    
    return wallet
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function setWalletCookie(wallet: string) {
  cookies().set('wallet', wallet, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })
}

export async function getUser(): Promise<User | null> {
  const walletAddress = await getWalletAddress()
  if (!walletAddress) return null

  await dbConnect()
  const user = await UserModel.findOne({ walletAddress }).lean() as User | null
  return user
}

export async function createUserIfNotExists(walletAddress: string): Promise<User> {
  await dbConnect()
  
  let user = await UserModel.findOne({ walletAddress })
  if (!user) {
    user = await UserModel.create({
      walletAddress,
      stats: {
        totalAgents: 0,
        competitionsWon: 0,
        tokensEarned: 0,
        winRate: 0
      }
    })
  }
  
  return user
} 