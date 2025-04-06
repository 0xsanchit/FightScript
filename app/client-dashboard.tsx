export async function fetchUserData(wallet: string) {
  const response = await fetch(`/api/users?wallet=${wallet}`, {
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