"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "react-hot-toast"
import CompetitionsNavbar from "@/components/competitions-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { startMatch, fetchUserStats } from '../../lib/api'

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
  id: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  rank: number;
}

interface MatchResult {
  winner: number;
  reason: string;
  moves: string[];
  agent1: { id: string; name: string };
  agent2: { id: string; name: string };
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  error: string | null;
  success: boolean;
}

export default function ChessCompetition() {
  const { publicKey } = useWallet();
  const [username, setUsername] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [userAgent, setUserAgent] = useState<Agent | null>(null);
  const [leaderboard, setLeaderboard] = useState<Agent[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [matchStatus, setMatchStatus] = useState<string>('');
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    error: null,
    success: false
  });

  useEffect(() => {
    fetchEngineStatus();
    if (publicKey) {
      fetchUserAgent();
      fetchLeaderboard();
      fetchUsername();
    }
  }, [publicKey]);

  const fetchUsername = async () => {
    if (!publicKey) return;
    try {
      const response = await fetch(`/api/user/${publicKey.toString()}`);
      const data = await response.json();
      setUsername(data.username || 'Anonymous');
    } catch (error) {
      console.error('Failed to fetch username:', error);
      setUsername('Anonymous');
    }
  };

  const fetchEngineStatus = async () => {
    try {
      const response = await fetch('/api/chess/status');
      const data = await response.json();
      setEngineStatus(data);
    } catch (error) {
      console.error('Failed to fetch engine status:', error);
    }
  };

  const fetchUserAgent = async () => {
    if (!publicKey) return;
    try {
      const response = await fetch(`/api/chess/agent/${publicKey.toString()}`);
      const data = await response.json();
      setUserAgent(data);
    } catch (error) {
      console.error('Failed to fetch user agent:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/chess/leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadState(prev => ({ ...prev, error: 'Please select a file' }));
      return;
    }

    if (!file.name.endsWith('.cpp')) {
      setUploadState(prev => ({ ...prev, error: 'Only C++ (.cpp) files are allowed' }));
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      file, 
      error: null,
      success: false 
    }));
  };

  const handleUpload = async () => {
    if (!publicKey) {
      setUploadState(prev => ({ ...prev, error: 'Please connect your wallet' }));
      return;
    }

    if (!uploadState.file) {
      setUploadState(prev => ({ ...prev, error: 'Please select a file' }));
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('wallet', publicKey.toString());

      console.log('Uploading file:', uploadState.file.name);

      const response = await fetch('/api/upload/agent', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Upload failed');
      }

      console.log('Upload successful:', data);

      setUploadState(prev => ({ 
        ...prev, 
        success: true, 
        error: null,
        file: null 
      }));
      fetchUserAgent();
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to upload file. Please try again.' 
      }));
    } finally {
      setUploadState(prev => ({ ...prev, uploading: false }));
    }
  };

  const startMatch = async () => {
    if (!userAgent || !selectedOpponent) {
      setMatchStatus('Please select an opponent');
      return;
    }

    try {
      setMatchStatus('Match in progress...');
      const response = await fetch('/api/chess/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent1Id: userAgent.id,
          agent2Id: selectedOpponent
        }),
      });

      const result = await response.json();
      setMatchStatus(`Match completed! ${result.reason}`);
      fetchLeaderboard();
      fetchUserAgent();
    } catch (error) {
      setMatchStatus('Failed to start match');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CompetitionsNavbar />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Chess AI Arena</h1>
          {publicKey && (
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{username}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Your Chess Agent</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Agent File (.cpp)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".cpp"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        C++ files only (.cpp)
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!uploadState.file || uploadState.uploading}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
                    ${!uploadState.file || uploadState.uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {uploadState.uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
            
            {/* Status Messages */}
            {uploadState.error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{uploadState.error}</p>
                  </div>
                </div>
              </div>
            )}

            {uploadState.success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Bot uploaded successfully!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                  {engineStatus.ready ? 'Ready' : 'Initializing'}
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
                Your Agent
              </label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{userAgent?.name}</p>
                <p className="text-sm text-gray-500">Rank: {userAgent?.rank}</p>
              </div>
            </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Opponent
              </label>
              <select
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select an opponent</option>
                {leaderboard
                  .filter(agent => agent.id !== userAgent?.id)
                  .map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} (Rank: {agent.rank})
                    </option>
                  ))}
              </select>
            </div>
          </div>
          {uploadState.error && (
            <p className="text-red-600 mt-4">{uploadState.error}</p>
          )}
          <button
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={startMatch}
            disabled={!selectedOpponent}
          >
            Start Match
          </button>
          {matchStatus && (
            <div className="mt-4 p-4 rounded-md bg-blue-50">
              <p className="text-sm text-blue-700">{matchStatus}</p>
            </div>
          )}
        </div>

        {/* Local Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Local Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Losses</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((agent, index) => (
                  <tr key={agent.id} className={agent.id === userAgent?.id ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.wins}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.losses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

