"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"

interface UserOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserOnboardingModal({ isOpen, onClose }: UserOnboardingModalProps) {
  const { publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profileImage: "", // Default empty string as per model
  })

  console.log('UserOnboardingModal rendered:', { isOpen, hasPublicKey: !!publicKey })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      console.log('No public key found')
      toast.error("Please connect your wallet first")
      return
    }

    if (!formData.username.trim()) {
      console.log('Username is empty')
      toast.error("Username is required")
      return
    }

    if (!formData.bio.trim()) {
      console.log('Bio is empty')
      toast.error("Bio is required")
      return
    }

    setIsLoading(true)
    try {
      console.log('Submitting user data:', { ...formData, walletAddress: publicKey.toString() })
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          username: formData.username.trim(),
          bio: formData.bio.trim(),
          profileImage: formData.profileImage,
          role: "user",
          stats: {
            totalAgents: 0,
            competitionsWon: 0,
            tokensEarned: 0,
            winRate: 0
          },
          totalEarnings: 0
        }),
      })

      console.log('User creation response status:', response.status)
      if (!response.ok) {
        const error = await response.json()
        console.error('User creation error:', error)
        throw new Error(error.message || "Failed to create user")
      }

      console.log('User created successfully')
      toast.success("Profile created successfully!")
      onClose()
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Choose a unique username"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              maxLength={500}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 