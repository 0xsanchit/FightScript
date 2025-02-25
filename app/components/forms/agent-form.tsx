"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AgentForm() {
  const { publicKey } = useWallet()
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    description: "",
    sourceCode: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) return

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user: publicKey.toString()
        }),
      })

      if (response.ok) {
        alert('Agent created successfully!')
      }
    } catch (error) {
      console.error('Error creating agent:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Agent Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chess">Chess</SelectItem>
            <SelectItem value="strategy">Strategy</SelectItem>
            <SelectItem value="trading">Trading</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          maxLength={500}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Source Code URL</label>
        <Input
          type="url"
          value={formData.sourceCode}
          onChange={(e) => setFormData({ ...formData, sourceCode: e.target.value })}
          required
        />
      </div>
      <Button type="submit" className="w-full">Submit Agent</Button>
    </form>
  )
} 