import { headers } from 'next/headers'
import { User } from '@/types/user'
import dbConnect from './mongodb'
import UserModel from '@/models/User'

export async function getWalletAddress(): Promise<string | null> {
  const headersList = headers()
  const walletAddress = headersList.get('x-wallet-address')
  return walletAddress
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