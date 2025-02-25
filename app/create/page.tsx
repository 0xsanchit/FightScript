"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRegistrationForm } from "@/components/forms/user-registration-form"
import { AgentForm } from "@/components/forms/agent-form"

export default function CreatePage() {
  const { publicKey } = useWallet()

  if (!publicKey) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Please connect your wallet to create content
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create</h1>
      
      <Tabs defaultValue="profile" className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Create Profile</h2>
            <UserRegistrationForm />
          </div>
        </TabsContent>
        
        <TabsContent value="agent" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Submit Agent</h2>
            <AgentForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 