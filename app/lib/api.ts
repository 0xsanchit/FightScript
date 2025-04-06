const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://co3pe.onrender.com/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to fetch data');
  }
  return response.json();
}

export async function proxyRequest(path: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error in proxy request to ${path}:`, error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchUserStats(walletAddress: string) {
  try {
    const response = await fetch(`${API_BASE}/stats?wallet=${walletAddress}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Failed to fetch user stats');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error instanceof Error ? error : new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function startMatch(agent1Id: string, agent2Id: string) {
  try {
    const response = await fetch(`${API_BASE}/competitions/chess/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent1Id,
        agent2Id
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error starting match:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchEngineStatus() {
  try {
    const response = await fetch(`${API_BASE}/competitions/chess/status`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching engine status:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchUserAgents(wallet: string) {
  try {
    const response = await fetch(`${API_BASE}/competitions/chess/agents/${wallet}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching user agents:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function uploadAgent(file: File, wallet: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('wallet', wallet);

    const response = await fetch(`${API_BASE}/upload/agent`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error uploading agent:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchUser(walletAddress: string) {
  try {
    console.log('Fetching user with wallet:', walletAddress);
    console.log('Using API URL:', API_BASE);
    
    const response = await fetch(`${API_BASE}/users?wallet=${walletAddress}`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('Error response:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('User data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error instanceof Error ? error : new Error('Failed to connect to server. Please make sure the server is running.');
  }
} 