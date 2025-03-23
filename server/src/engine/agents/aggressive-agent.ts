import { ChessMove } from '../types/chess';

interface Position {
  piece: string;
  square: string;
}

interface PrioritizedMove {
  move: string;
  priority: number;
}

// Agent that prefers aggressive center control and attacking moves
export async function getMove(fen: string): Promise<string> {
  try {
    // Parse FEN to determine side to move
    const [position, sideToMove] = fen.split(' ') as [string, 'w' | 'b'];
    const isWhite: boolean = sideToMove === 'w';

    // Parse position into piece locations
    const pieces: Position[] = [];
    const ranks: string[] = position.split('/');
    
    ranks.forEach((rank: string, rankIndex: number) => {
      let fileIndex: number = 0;
      for (let i: number = 0; i < rank.length; i++) {
        const char: string = rank[i];
        if (/\d/.test(char)) {
          fileIndex += parseInt(char, 10);
        } else {
          const file: string = String.fromCharCode(97 + fileIndex);
          const square: string = `${file}${8 - rankIndex}`;
          pieces.push({ piece: char, square });
          fileIndex++;
        }
      }
    });

    // Filter my pieces
    const myPieces: Position[] = pieces.filter(({ piece }) => 
      isWhite ? piece === piece.toUpperCase() : piece === piece.toLowerCase()
    );

    // Prioritized moves based on strategy
    const moves: PrioritizedMove[] = [];

    myPieces.forEach(({ piece, square }: Position) => {
      const [file, rank]: [string, string] = square.split('') as [string, string];
      const fileNum: number = file.charCodeAt(0) - 97;
      const rankNum: number = parseInt(rank, 10);

      // Center pawn moves (highest priority)
      if (piece.toLowerCase() === 'p') {
        const direction: number = isWhite ? 1 : -1;
        if ((file === 'e' || file === 'd') && 
            ((isWhite && rank === '2') || (!isWhite && rank === '7'))) {
          moves.push({ 
            move: `${square}${file}${rankNum + (2 * direction)}`,
            priority: 10 
          });
        }
      }

      // Knight development to center squares
      if (piece.toLowerCase() === 'n') {
        const centerKnightMoves: string[] = isWhite ? 
          ['b1d2', 'g1f3'] : ['b8d7', 'g8f6'];
        centerKnightMoves.forEach((move: string) => {
          if (move.startsWith(square)) {
            moves.push({ move, priority: 8 });
          }
        });
      }

      // Bishop development
      if (piece.toLowerCase() === 'b') {
        const bishopMoves: string[] = isWhite ?
          ['f1c4', 'c1f4'] : ['f8c5', 'c8f5'];
        bishopMoves.forEach((move: string) => {
          if (move.startsWith(square)) {
            moves.push({ move, priority: 7 });
          }
        });
      }
    });

    // If no prioritized moves found, use basic center control moves
    if (moves.length === 0) {
      const basicMoves: PrioritizedMove[] = isWhite ?
        [
          { move: 'e2e4', priority: 5 },
          { move: 'd2d4', priority: 5 },
          { move: 'c2c4', priority: 4 }
        ] :
        [
          { move: 'e7e5', priority: 5 },
          { move: 'd7d5', priority: 5 },
          { move: 'c7c5', priority: 4 }
        ];
      moves.push(...basicMoves);
    }

    // Sort by priority and select highest priority move
    moves.sort((a: PrioritizedMove, b: PrioritizedMove) => b.priority - a.priority);
    const highestPriority: number = moves[0].priority;
    const bestMoves: PrioritizedMove[] = moves.filter(m => m.priority === highestPriority);
    
    // Random selection among equally good moves
    const moveIndex: number = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[moveIndex].move;
  } catch (error) {
    console.error('Aggressive agent error:', error);
    // Fallback to basic center pawn move if error occurs
    return isWhite ? 'e2e4' : 'e7e5';
  }
} 