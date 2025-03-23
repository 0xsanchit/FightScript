"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "react-hot-toast"
import CompetitionsNavbar from "@/components/competitions-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { startMatch, fetchUserStats } from '@/lib/api'

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

interface EngineStatus {
  version: string;
  ready: boolean;
  cores: number;
}

interface Agent {
  _id: string;
  name: string;
  wins: number;
  losses: number;
}

interface MatchResult {
  winner: number;
  reason: string;
  moves: string[];
  agent1: { id: string; name: string };
  agent2: { id: string; name: string };
}

export default function ChessCompetition() {
  const { publicKey } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent1, setSelectedAgent1] = useState<string>('');
  const [selectedAgent2, setSelectedAgent2] = useState<string>('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
      const response = await fetch('/api/upload/agent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      toast.success('Agent uploaded successfully!');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload agent');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  useEffect(() => {
    fetchEngineStatus();
    if (publicKey) {
      fetchUserAgents();
    }
  }, [publicKey]);

  const fetchEngineStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/competitions/chess/status');
      const data = await response.json();
      setEngineStatus(data);
    } catch (error) {
      setError('Failed to fetch engine status');
    }
  };

  const fetchUserAgents = async () => {
    if (!publicKey) return;
    try {
      const response = await fetch(`http://localhost:5000/api/competitions/chess/agents/${publicKey.toString()}`);
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      setError('Failed to fetch agents');
    }
  };

  const handleStartMatch = async () => {
    if (!selectedAgent1 || !selectedAgent2) {
      setError('Please select both agents');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await startMatch(selectedAgent1, selectedAgent2);
      setMatchResult(result);
    } catch (error) {
      setError('Failed to start match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CompetitionsNavbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Chess AI Arena</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Your Chess Agent</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Agent File (.js, .ts, .py)
              </label>
              <input
                type="file"
                accept=".js,.ts,.py"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium
                ${!file || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {uploading ? 'Uploading...' : 'Upload Agent'}
            </button>
          </div>
        </div>

        <div className="mt-12">
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

        {/* Engine Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Chess Engine Status</h2>
          {engineStatus ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">Version</p>
                <p className="font-semibold">{engineStatus.version}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className={`font-semibold ${engineStatus.ready ? 'text-green-600' : 'text-red-600'}`}>
                  {engineStatus.ready ? 'Ready' : 'Not Ready'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">CPU Cores</p>
                <p className="font-semibold">{engineStatus.cores}</p>
              </div>
            </div>
          ) : (
            <p>Loading engine status...</p>
          )}
        </div>

        {/* Agent Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Start a Match</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent 1
              </label>
              <select
                className="w-full border rounded-md p-2"
                value={selectedAgent1}
                onChange={(e) => setSelectedAgent1(e.target.value)}
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} ({agent.wins}W/{agent.losses}L)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent 2
              </label>
              <select
                className="w-full border rounded-md p-2"
                value={selectedAgent2}
                onChange={(e) => setSelectedAgent2(e.target.value)}
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} ({agent.wins}W/{agent.losses}L)
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="text-red-600 mt-4">{error}</p>
          )}
          <button
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={handleStartMatch}
            disabled={loading || !selectedAgent1 || !selectedAgent2}
          >
            {loading ? 'Starting Match...' : 'Start Match'}
          </button>
        </div>

        {/* Match Result */}
        {matchResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Match Result</h2>
            <div className="space-y-4">
              <p className="text-lg">
                Winner: {matchResult.winner === 1 ? matchResult.agent1.name : matchResult.agent2.name}
              </p>
              <p className="text-gray-600">Reason: {matchResult.reason}</p>
              <div>
                <h3 className="font-semibold mb-2">Moves:</h3>
                <div className="bg-gray-100 p-4 rounded-md">
                  {matchResult.moves.map((move, index) => (
                    <span key={index} className="mr-2">
                      {index + 1}. {move}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

