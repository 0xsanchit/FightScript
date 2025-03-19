"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "react-hot-toast"
import CompetitionsNavbar from "@/components/competitions-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const leaderboardData = [
  { rank: 1, name: "AlphaChess", wins: 150, losses: 20 },
  { rank: 2, name: "DeepMate", wins: 140, losses: 30 },
  { rank: 3, name: "QuantumKnight", wins: 130, losses: 40 },
  { rank: 4, name: "NeuralRook", wins: 120, losses: 50 },
  { rank: 5, name: "AIBishop", wins: 110, losses: 60 },
]

interface UploadResponse {
  message: string;
  fileId: string;
}

export default function ChessArenaPage() {
  const { publicKey } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !publicKey) {
      toast.error('Please select a file and connect your wallet');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('agent', file);
    formData.append('wallet', publicKey.toString());

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: UploadResponse = await response.json();
      toast.success('File uploaded successfully!');
      
      // Create activity log for the upload
      await fetch('http://localhost:5000/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'agent_submit',
          title: 'Chess Agent Submitted',
          description: `Submitted chess agent: ${file.name}`,
          user: publicKey.toString(),
          metadata: {
            fileName: file.name,
            fileId: data.fileId,
            competition: 'chess'
          }
        }),
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CompetitionsNavbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Chess AI Arena</h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Upload Your AI Agent</h2>
          <form onSubmit={handleUpload} className="flex items-center space-x-4">
            <Input type="file" onChange={handleFileChange} accept=".py,.js,.json" className="flex-grow" />
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload Agent'}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Local Leaderboard</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Agent Name</TableHead>
                <TableHead>Wins</TableHead>
                <TableHead>Losses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((row) => (
                <TableRow key={row.rank}>
                  <TableCell className="font-medium">{row.rank}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.wins}</TableCell>
                  <TableCell>{row.losses}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}

