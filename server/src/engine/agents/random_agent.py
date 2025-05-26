import pickle
import random
import chess
from typing import Dict, Any, Optional
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agent import ChessAgent

def generate_random_agent() -> ChessAgent:
    """Generate a random chess agent with random parameters."""
    agent = ChessAgent()
    return agent

def save_agent(agent: ChessAgent, filename: str) -> None:
    """Save an agent to a file using pickle."""
    with open(filename, 'wb') as f:
        pickle.dump(agent, f)

if __name__ == "__main__":
    # Example usage
    agent = generate_random_agent()
    save_agent(agent, "random_agent.pkl")
