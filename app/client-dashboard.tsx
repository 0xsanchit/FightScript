const response = await fetch(`http://localhost:5000/api/users?wallet=${wallet}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
}); 