declare module "@solana/wallet-adapter-react" {
  import { PublicKey } from "@solana/web3.js"

  export function useWallet(): {
    publicKey: PublicKey | null
    disconnect: () => Promise<void>
  }

  export function useConnection(): {
    connection: any
  }
}

declare module "@solana/wallet-adapter-react-ui" {
  import { FC } from "react"
  
  interface WalletMultiButtonProps {
    className?: string
    style?: React.CSSProperties
  }

  export const WalletMultiButton: FC<WalletMultiButtonProps>
} 