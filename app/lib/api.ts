const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchUserStats(wallet: string) {
  const response = await fetch(`${API_BASE}/users/stats?wallet=${wallet}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }
  return response.json();
}

export async function startMatch(agent1Id: string, agent2Id: string) {
  const response = await fetch(`${API_BASE}/competitions/chess/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ agent1Id, agent2Id }),
  });
  if (!response.ok) {
    throw new Error('Failed to start match');
  }
  return response.json();
}

export async function fetchEngineStatus() {
  const response = await fetch(`${API_BASE}/competitions/chess/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch engine status');
  }
  return response.json();
}

export async function fetchUserAgents(wallet: string) {
  const response = await fetch(`${API_BASE}/competitions/chess/agents/${wallet}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user agents');
  }
  return response.json();
} 