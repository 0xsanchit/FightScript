import chess
from typing import Optional
import random

class ChessAgent:
    def __init__(self):
        self.name = "Agent"
        # Initialize default parameters 
        pass

    def make_move(self, board: chess.Board, time_limit: float) -> chess.Move:
        """
        Make a move based on the current board state.
        Handles timeouts and returns None if no move can be made.
        """
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None
        return random.choice(legal_moves)