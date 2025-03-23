import { ChessMove } from '../types/chess';

interface Position {
  piece: string;
  square: string;
}

interface ChessPosition {
  pieces: Position[];
  sideToMove: 'w' | 'b';
}

// Simple agent that makes random legal moves
export async function getMove(fen: string): Promise<string> {
  try {
    // Parse FEN to determine side to move
    const [position, sideToMove] = fen.split(' ') as [string, 'w' | 'b'];
    const isWhite: boolean = sideToMove === 'w';

    // Get all pieces and their positions
    const pieces: Position[] = [];
    const ranks: string[] = position.split('/');
    
    ranks.forEach((rank: string, rankIndex: number) => {
      let fileIndex: number = 0;
      for (let i: number = 0; i < rank.length; i++) {
        const char: string = rank[i];
        if (/\d/.test(char)) {
          fileIndex += parseInt(char, 10);
        } else {
          const file: string = String.fromCharCode(97 + fileIndex); // 'a' through 'h'
          const square: string = `${file}${8 - rankIndex}`;
          pieces.push({ piece: char, square });
          fileIndex++;
        }
      }
    });

    // Filter pieces based on side to move
    const myPieces: Position[] = pieces.filter(({ piece }) => 
      isWhite ? piece === piece.toUpperCase() : piece === piece.toLowerCase()
    );

    // Generate possible moves for each piece
    const possibleMoves: string[] = [];
    
    myPieces.forEach(({ piece, square }: Position) => {
      const [file, rank]: [string, string] = square.split('') as [string, string];
      const fileNum: number = file.charCodeAt(0) - 97; // 0-7 for a-h
      const rankNum: number = parseInt(rank, 10);

      // Pawn moves
      if (piece.toLowerCase() === 'p') {
        const direction: number = isWhite ? 1 : -1;
        const startRank: number = isWhite ? 2 : 7;
        
        // Forward one square
        const newRank: number = rankNum + direction;
        if (newRank >= 1 && newRank <= 8) {
          possibleMoves.push(`${square}${file}${newRank}`);
        }
        
        // Initial two square move
        if (rankNum === startRank) {
          const doubleRank: number = rankNum + (2 * direction);
          possibleMoves.push(`${square}${file}${doubleRank}`);
        }
      }

      // Knight moves
      if (piece.toLowerCase() === 'n') {
        const knightMoves: [number, number][] = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dx, dy]: [number, number]) => {
          const newFile: number = fileNum + dx;
          const newRank: number = rankNum + dy;
          if (newFile >= 0 && newFile < 8 && newRank > 0 && newRank <= 8) {
            const newSquare: string = `${String.fromCharCode(97 + newFile)}${newRank}`;
            possibleMoves.push(`${square}${newSquare}`);
          }
        });
      }

      // Rook moves
      if (piece.toLowerCase() === 'r') {
        for (let i: number = 1; i <= 8; i++) {
          if (i !== rankNum) possibleMoves.push(`${square}${file}${i}`);
          if (i !== fileNum + 1) {
            const newFile: string = String.fromCharCode(97 + i - 1);
            possibleMoves.push(`${square}${newFile}${rank}`);
          }
        }
      }
    });

    // If no valid moves found, use basic pawn moves as fallback
    if (possibleMoves.length === 0) {
      const basicMoves: string[] = isWhite ? 
        ['e2e4', 'd2d4', 'c2c4', 'b2b3', 'g2g3', 'a2a3', 'h2h3', 'f2f3'] :
        ['e7e5', 'd7d5', 'c7c5', 'b7b6', 'g7g6', 'a7a6', 'h7h6', 'f7f6'];
      return basicMoves[Math.floor(Math.random() * basicMoves.length)];
    }

    // Random selection from possible moves
    const moveIndex: number = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
  } catch (error) {
    console.error('Random agent error:', error);
    // Fallback to basic pawn move if error occurs
    return 'e2e4';
  }
} 