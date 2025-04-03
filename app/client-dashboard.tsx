export async function fetchUserData(wallet: string) {
  const response = await fetch(`http://localhost:5000/api/users?wallet=${wallet}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return response.json();
} 