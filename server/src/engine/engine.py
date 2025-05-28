import chess
import chess.pgn
import time
from typing import Optional, Tuple
import importlib
import io
import sys
import os
import copy

class ChessMatch:
    def __init__(self, agent1, agent2, time_limit_per_move: float = 5.0):
        self.agent1 = agent1
        self.agent2 = agent2
        self.time_limit_per_move = time_limit_per_move
        self.board = chess.Board()
        self.game = chess.pgn.Game()
        self.game.headers["White"] = agent1.name
        self.game.headers["Black"] = agent2.name
        self.node = self.game
    
    def play_move(self) -> Optional[Tuple[bool, str]]:
        """Play one move in the game. Returns (game_over, reason) or None if game continues."""
        if self.board.is_game_over():
            return True, self.board.result()
        
        current_agent = self.agent1 if self.board.turn == chess.WHITE else self.agent2
        
        try:
            board_copy = self.board.copy()
            move = current_agent.make_move(board_copy, self.time_limit_per_move)
            if move is None:
                return True, "illegal move"
            
            if move not in self.board.legal_moves:
                return True, "illegal move"
            
            self.board.push(move)
            self.node = self.node.add_variation(move)
            return None
        except Exception as e:
            print(f"Error during move: {e}", file=sys.stderr)
            return True, "agent error"
    
    def play_full_game(self) -> Tuple[str, chess.pgn.Game]:
        """Play a full game until completion. Returns (result, game)."""
        while True:
            status = self.play_move()
            if status is not None:
                game_over, reason = status
                if game_over:
                    self.game.headers["Result"] = self.board.result()
                    return self.board.result(), self.game
            
    
    def get_pgn(self) -> str:
        """Return the PGN string of the current game."""
        exporter = chess.pgn.StringExporter(headers=False, variations=True, comments=True)
        return self.game.accept(exporter)

def load_agent(file_path) :
    spec = importlib.util.spec_from_file_location("temp_module", file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.ChessAgent()

def run_match(agent1_file: str, agent2_file: str, time_limit: float = 5.0) -> Tuple[str, str]:
    """Run a match between two agents loaded from files."""
    try:
        agent1 = load_agent(agent1_file)
        agent2 = load_agent(agent2_file)
        # print(agent1_file)
        # print(agent2_file)
        # agent1 = importlib.import_module(agent1_file.strip("/").strip("\\").replace("/", ".").replace("\\", ".")).ChessAgent()
        # agent2 = importlib.import_module(agent2_file.strip("/").strip("\\").replace("/", ".").replace("\\", ".")).ChessAgent()
    except Exception as e:
        return f"Error loading agents: {e}", ""
    
    match = ChessMatch(agent1, agent2, time_limit)
    result, game = match.play_full_game()
    pgn = match.get_pgn()
    
    return result, pgn

if __name__ == "__main__":
    # Example usage
    if len(sys.argv) != 3:
        print("Usage: python chess_engine.py <agent1_file> <agent2_file>")
        sys.exit(1)
    
    agent1_file = sys.argv[1]
    agent2_file = sys.argv[2]
    
    result, pgn = run_match(agent1_file, agent2_file)
    if result == "1/2-1/2" :
        print(0)
    elif result == "1-0" :
        print(1)
    elif result == "0-1" :
        print(2)
    print(pgn)

