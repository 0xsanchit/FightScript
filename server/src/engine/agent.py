import chess
from typing import Optional
import os 
import pickle
import random

class ChessAgent:
    def __init__(self):
        self.name = "Agent"
        # Initialize default parameters 
        pass

    def make_move(self, board: chess.Board, time_limit: Optional[float] = None) -> chess.Move:
        """
        Make a move based on the current board state.
        Handles timeouts and returns None if no move can be made.
        """
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None
        return random.choice(legal_moves)

def load_agent(filename: str) -> ChessAgent:
    """Load an agent from a file."""
    if not os.path.exists(filename):
        raise FileNotFoundError(f"Agent file {filename} not found")
    
    with open(filename, 'rb') as f:
        agent = pickle.load(f)
    
    if not isinstance(agent, ChessAgent):
        raise ValueError("Loaded object is not a ChessAgent")
    
    return agent