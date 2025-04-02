"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "react-hot-toast"
import CompetitionsNavbar from "@/components/competitions-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { startMatch, fetchUserStats } from '../../lib/api'
import { LoadingState } from "@/components/ui/loading-state"

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
  draws: number;
  points: number;
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

interface User {
  username: string;
  walletAddress: string;
}

interface MatchStatus {
  status: 'idle' | 'compiling' | 'running' | 'completed' | 'error';
  message: string;
  winner?: 'user' | 'bot' | 'draw';
  moves?: string[];
}

const MatchResultDisplay = ({ status, winner, moves }: MatchStatus) => {
  if (status !== 'completed') return null;

  return (
    <div className="mt-4 p-4 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-2">Match Result</h3>
      {winner === 'user' && (
        <div className="text-green-500">
          <p className="text-xl font-bold">🎉 You Won!</p>
          <p>Your agent defeated the aggressive bot.</p>
        </div>
      )}
      {winner === 'bot' && (
        <div className="text-red-500">
          <p className="text-xl font-bold">😢 Bot Won</p>
          <p>The aggressive bot defeated your agent.</p>
        </div>
      )}
      {winner === 'draw' && (
        <div className="text-yellow-500">
          <p className="text-xl font-bold">🤝 Draw</p>
          <p>The match ended in a draw.</p>
        </div>
      )}
      {moves && moves.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Move History:</h4>
          <div className="grid grid-cols-5 gap-2">
            {moves.map((move, index) => (
              <span key={index} className="bg-muted p-1 rounded text-sm">
                {move}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChessCompetition() {
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [engineStatus, setEngineStatus] = useState("Loading engine status...");
  const [userAgent, setUserAgent] = useState<Agent | null>(null);
  const [leaderboard, setLeaderboard] = useState<Agent[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<string>("");
  const [matchStatus, setMatchStatus] = useState<MatchStatus>({
    status: 'idle',
    message: 'Waiting for agent upload...'
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    error: null,
    success: false
  });

  useEffect(() => {
    fetchUser();
    if (publicKey) {
      fetchUserAgent();
      fetchLeaderboard();
    }
  }, [publicKey]);

  const fetchUser = async () => {
    if (!publicKey) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users?wallet=${publicKey.toString()}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setIsLoading(false);
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
      toast.error('Please connect your wallet');
      return;
    }

    if (!uploadState.file) {
      toast.error('Please select a file');
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true, error: null }));
    setMatchStatus({
      status: 'compiling',
      message: 'Uploading and compiling your agent...'
    });

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('wallet', publicKey.toString());

      console.log('Uploading file:', uploadState.file.name);

      const uploadResponse = await fetch('/api/upload/agent', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || uploadData.error || 'Upload failed');
      }

      console.log('Upload successful:', uploadData);

      setMatchStatus({
        status: 'running',
        message: 'Starting match against aggressive bot...'
      });

      const matchResponse = await fetch('/api/chess/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          opponent: 'aggressive_bot'
        }),
      });

      const matchData = await matchResponse.json();

      if (!matchResponse.ok) {
        throw new Error(matchData.message || 'Failed to start match');
      }

      setMatchStatus({
        status: 'running',
        message: 'Match in progress...'
      });
      
      pollMatchStatus(matchData.matchId);

      setUploadState(prev => ({ 
        ...prev, 
        success: true, 
        error: null,
        file: null 
      }));

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process agent';
      setUploadState(prev => ({ 
        ...prev, 
        error: errorMessage
      }));
      setMatchStatus({
        status: 'error',
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setUploadState(prev => ({ ...prev, uploading: false }));
    }
  };

  const pollMatchStatus = async (matchId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chess/match/${matchId}/status`);
        const data = await response.json();

        // Log the response for debugging
        console.log('Match status response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch match status');
        }

        setMatchStatus({
          status: data.status,
          message: data.message,
          winner: data.winner,
          moves: data.moves
        });

        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(pollInterval);
          fetchUserAgent();
          fetchLeaderboard();
          
          if (data.status === 'completed') {
            if (data.winner === 'user') {
              toast.success('Congratulations! Your agent won the match!');
            } else if (data.winner === 'bot') {
              toast.error('The aggressive bot won the match.');
            } else {
              toast('The match ended in a draw.', {
                style: {
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fbbf24'
                }
              });
            }
          } else if (data.status === 'error') {
            toast.error(data.message || 'An error occurred during the match');
          }
        }
      } catch (error) {
        console.error('Error polling match status:', error);
        clearInterval(pollInterval);
        setMatchStatus({
          status: 'error',
          message: error instanceof Error ? error.message : 'Error checking match status'
        });
        toast.error('Failed to check match status');
      }
    }, 2000);

    // Clean up interval on component unmount
    return () => clearInterval(pollInterval);
  };

  const startMatch = async () => {
    if (!userAgent || !selectedOpponent) {
      setMatchStatus({
        status: 'error',
        message: 'Please select an opponent'
      });
      return;
    }

    try {
      setMatchStatus({
        status: 'compiling',
        message: 'Match in progress...',
        winner: undefined
      });
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
      setMatchStatus({
        status: 'completed',
        message: `Match completed! ${result.reason}`,
        winner: result.winner.toString()
      });
      fetchLeaderboard();
      fetchUserAgent();
    } catch (error) {
      setMatchStatus({
        status: 'error',
        message: 'Failed to start match'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CompetitionsNavbar />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Chess AI Arena</h1>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {isLoading ? (
                <LoadingState />
              ) : user ? (
                user.username
              ) : (
                "Anonymous"
              )}
            </span>
          </div>
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

        
        {/* Engine Status with more detail */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Match Status</h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${
              matchStatus.status === 'completed' 
                ? 'bg-green-50 border border-green-200' 
                : matchStatus.status === 'error'
                ? 'bg-red-50 border border-red-200'
                : matchStatus.status === 'running'
                ? 'bg-blue-50 border border-blue-200'
                : matchStatus.status === 'compiling'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center">
                {matchStatus.status === 'running' && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <p className={`text-sm font-medium ${
                  matchStatus.status === 'completed'
                    ? 'text-green-800'
                    : matchStatus.status === 'error'
                    ? 'text-red-800'
                    : matchStatus.status === 'running'
                    ? 'text-blue-800'
                    : matchStatus.status === 'compiling'
                    ? 'text-yellow-800'
                    : 'text-gray-800'
                }`}>
                  {matchStatus.message}
                </p>
              </div>
            </div>

            {/* Match Result Display */}
            <MatchResultDisplay {...matchStatus} />
          </div>
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
          {matchStatus.status !== 'idle' && (
            <div className="mt-4 p-4 rounded-md bg-blue-50">
              <p className="text-sm text-blue-700">{matchStatus.message}</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draws</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Losses</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((agent, index) => (
                  <tr key={agent.id} className={agent.id === userAgent?.id ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{agent.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{agent.wins}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{agent.draws}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{agent.losses}</td>
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

