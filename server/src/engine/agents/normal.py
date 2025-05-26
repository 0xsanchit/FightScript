import chess
import chess.pgn
import math
from typing import Dict, List, Optional, Tuple
import time
import sys
import os

class ChessAgent():
    def __init__(self, depth: int = 3, name: str = "AdvancedAgent"):
        super().__init__
        self.name = name
        self.depth = depth  # Search depth for minimax
        self.nodes_searched = 0
        self.transposition_table = {}
        
        # Piece values (centipawns)
        self.piece_values = {
            chess.PAWN: 100,
            chess.KNIGHT: 320,
            chess.BISHOP: 330,
            chess.ROOK: 500,
            chess.QUEEN: 900,
            chess.KING: 20000
        }
        
        # Piece-square tables (midgame)
        self.piece_square_tables = {
            chess.PAWN: [
                 0,   0,   0,   0,   0,   0,   0,   0,
                50,  50,  50,  50,  50,  50,  50,  50,
                10,  10,  20,  30,  30,  20,  10,  10,
                 5,   5,  10,  25,  25,  10,   5,   5,
                 0,   0,   0,  20,  20,   0,   0,   0,
                 5,  -5, -10,   0,   0, -10,  -5,   5,
                 5,  10,  10, -20, -20,  10,  10,   5,
                 0,   0,   0,   0,   0,   0,   0,   0
            ],
            chess.KNIGHT: [
                -50, -40, -30, -30, -30, -30, -40, -50,
                -40, -20,   0,   0,   0,   0, -20, -40,
                -30,   0,  10,  15,  15,  10,   0, -30,
                -30,   5,  15,  20,  20,  15,   5, -30,
                -30,   0,  15,  20,  20,  15,   0, -30,
                -30,   5,  10,  15,  15,  10,   5, -30,
                -40, -20,   0,   5,   5,   0, -20, -40,
                -50, -40, -30, -30, -30, -30, -40, -50
            ],
            chess.BISHOP: [
                -20, -10, -10, -10, -10, -10, -10, -20,
                -10,   0,   0,   0,   0,   0,   0, -10,
                -10,   0,   5,  10,  10,   5,   0, -10,
                -10,   5,   5,  10,  10,   5,   5, -10,
                -10,   0,  10,  10,  10,  10,   0, -10,
                -10,  10,  10,  10,  10,  10,  10, -10,
                -10,   5,   0,   0,   0,   0,   5, -10,
                -20, -10, -10, -10, -10, -10, -10, -20
            ],
            chess.ROOK: [
                 0,   0,   0,   0,   0,   0,   0,   0,
                 5,  10,  10,  10,  10,  10,  10,   5,
                -5,   0,   0,   0,   0,   0,   0,  -5,
                -5,   0,   0,   0,   0,   0,   0,  -5,
                -5,   0,   0,   0,   0,   0,   0,  -5,
                -5,   0,   0,   0,   0,   0,   0,  -5,
                -5,   0,   0,   0,   0,   0,   0,  -5,
                 0,   0,   0,   5,   5,   0,   0,   0
            ],
            chess.QUEEN: [
                -20, -10, -10,  -5,  -5, -10, -10, -20,
                -10,   0,   0,   0,   0,   0,   0, -10,
                -10,   0,   5,   5,   5,   5,   0, -10,
                 -5,   0,   5,   5,   5,   5,   0,  -5,
                  0,   0,   5,   5,   5,   5,   0,  -5,
                -10,   5,   5,   5,   5,   5,   0, -10,
                -10,   0,   5,   0,   0,   0,   0, -10,
                -20, -10, -10,  -5,  -5, -10, -10, -20
            ],
            chess.KING: [
                -30, -40, -40, -50, -50, -40, -40, -30,
                -30, -40, -40, -50, -50, -40, -40, -30,
                -30, -40, -40, -50, -50, -40, -40, -30,
                -30, -40, -40, -50, -50, -40, -40, -30,
                -20, -30, -30, -40, -40, -30, -30, -20,
                -10, -20, -20, -20, -20, -20, -20, -10,
                 20,  20,   0,   0,   0,   0,  20,  20,
                 20,  30,  10,   0,   0,  10,  30,  20
            ]
        }

    def make_move(self, board: chess.Board, time_limit: Optional[float] = None) -> chess.Move:
        print("Making move")
        """Select the best move using iterative deepening with time management."""
        start_time = time.time()
        best_move = None
        best_score = -math.inf
        depth = 1
        
        # Get all legal moves
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None
            
        # If only one move, return it immediately
        if len(legal_moves) == 1:
            return legal_moves[0]
            
        # Iterative deepening within time limit
        while depth <= self.depth:
            if time_limit and (time.time() - start_time) > time_limit / 2:
                break
                
            current_best_move = None
            current_best_score = -math.inf
            
            for move in legal_moves:
                board.push(move)
                score = -self.alphabeta(board, depth-1, -math.inf, math.inf)
                board.pop()
                
                if score > current_best_score:
                    current_best_score = score
                    current_best_move = move
            
            if current_best_move:
                best_move = current_best_move
                best_score = current_best_score
            
            depth += 1
        
        return best_move

    def alphabeta(self, board: chess.Board, depth: int, alpha: float, beta: float) -> float:
        """Minimax search with alpha-beta pruning."""
        self.nodes_searched += 1
        
        # Check for terminal node (leaf)
        if depth == 0 or board.is_game_over():
            return self.evaluate(board)
            
        # Generate legal moves and sort them for better pruning
        legal_moves = list(board.legal_moves)
        legal_moves.sort(key=lambda m: self.move_ordering(board, m), reverse=True)
        
        best_value = -math.inf
        for move in legal_moves:
            board.push(move)
            value = -self.alphabeta(board, depth-1, -beta, -alpha)
            board.pop()
            
            if value >= beta:
                return value
                
            if value > best_value:
                best_value = value
                if value > alpha:
                    alpha = value
        
        return best_value

    def move_ordering(self, board: chess.Board, move: chess.Move) -> float:
        """Simple move ordering for alpha-beta pruning."""
        # Prioritize captures
        if board.is_capture(move):
            captured_piece = board.piece_at(move.to_square)
            if captured_piece:
                return self.piece_values[captured_piece.piece_type] - self.piece_values[board.piece_at(move.from_square).piece_type] / 10
        return 0

    def evaluate(self, board: chess.Board) -> float:
        """Evaluate the board position."""
        if board.is_checkmate():
            return -math.inf if board.turn == chess.WHITE else math.inf
            
        if board.is_game_over():
            return 0
            
        # Material score
        material = 0
        for piece_type in chess.PIECE_TYPES:
            material += len(board.pieces(piece_type, chess.WHITE)) * self.piece_values[piece_type]
            material -= len(board.pieces(piece_type, chess.BLACK)) * self.piece_values[piece_type]
        
        # Piece-square tables
        positional = 0
        for piece_type in chess.PIECE_TYPES:
            for square in board.pieces(piece_type, chess.WHITE):
                positional += self.piece_square_tables[piece_type][square]
            for square in board.pieces(piece_type, chess.BLACK):
                positional -= self.piece_square_tables[piece_type][chess.square_mirror(square)]
        
        # Mobility (number of legal moves)
        mobility = len(list(board.legal_moves))
        board.turn = not board.turn
        mobility -= len(list(board.legal_moves))
        board.turn = not board.turn
        
        # Pawn structure
        pawn_structure = self.evaluate_pawn_structure(board)
        
        # Combine all factors
        total = (
            material * 1.0 + 
            positional * 0.1 + 
            mobility * 0.5 + 
            pawn_structure * 0.3
        )
        
        # Return from current player's perspective
        return total if board.turn == chess.WHITE else -total

    def evaluate_pawn_structure(self, board: chess.Board) -> float:
        """Evaluate pawn structure (isolated, doubled, passed pawns)."""
        white_score = 0
        black_score = 0
        
        # White pawns
        white_pawns = list(board.pieces(chess.PAWN, chess.WHITE))
        for square in white_pawns:
            file = chess.square_file(square)
            
            # Isolated pawn penalty
            has_friendly_pawn_on_adjacent_file = False
            for adj_file in [file-1, file+1]:
                if 0 <= adj_file < 8 and any(chess.square_file(p) == adj_file for p in white_pawns):
                    has_friendly_pawn_on_adjacent_file = True
                    break
            if not has_friendly_pawn_on_adjacent_file:
                white_score -= 10
                
            # Doubled pawn penalty
            if len([p for p in white_pawns if chess.square_file(p) == file]) > 1:
                white_score -= 15
                
            # Passed pawn bonus
            is_passed = True
            for rank in range(chess.square_rank(square) + 1, 8):
                for adj_file in [file-1, file, file+1]:
                    if 0 <= adj_file < 8:
                        target_square = chess.square(adj_file, rank)
                        if board.piece_at(target_square) and board.piece_at(target_square).piece_type == chess.PAWN and board.piece_at(target_square).color == chess.BLACK:
                            is_passed = False
                            break
                if not is_passed:
                    break
            if is_passed:
                white_score += 20 * (chess.square_rank(square) - 1)  # Bonus increases with advancement
        
        # Black pawns (mirrored logic)
        black_pawns = list(board.pieces(chess.PAWN, chess.BLACK))
        for square in black_pawns:
            file = chess.square_file(square)
            
            # Isolated pawn penalty
            has_friendly_pawn_on_adjacent_file = False
            for adj_file in [file-1, file+1]:
                if 0 <= adj_file < 8 and any(chess.square_file(p) == adj_file for p in black_pawns):
                    has_friendly_pawn_on_adjacent_file = True
                    break
            if not has_friendly_pawn_on_adjacent_file:
                black_score -= 10
                
            # Doubled pawn penalty
            if len([p for p in black_pawns if chess.square_file(p) == file]) > 1:
                black_score -= 15
                
            # Passed pawn bonus
            is_passed = True
            for rank in range(chess.square_rank(square) - 1, -1, -1):
                for adj_file in [file-1, file, file+1]:
                    if 0 <= adj_file < 8:
                        target_square = chess.square(adj_file, rank)
                        if board.piece_at(target_square) and board.piece_at(target_square).piece_type == chess.PAWN and board.piece_at(target_square).color == chess.WHITE:
                            is_passed = False
                            break
                if not is_passed:
                    break
            if is_passed:
                black_score += 20 * (6 - chess.square_rank(square))  # Bonus increases with advancement
        
        return white_score - black_score

def save_agent(agent, filename: str):
    """Save the agent to a file using pickle."""
    import pickle
    with open(filename, 'wb') as f:
        pickle.dump(agent, f)

def load_agent(filename: str):
    """Load an agent from a file."""
    import pickle
    with open(filename, 'rb') as f:
        return pickle.load(f)

if __name__ == "__main__":
    # Create and save an advanced agent
    agent = ChessAgent(depth=3)
    save_agent(agent, "advanced_agent.pkl")
