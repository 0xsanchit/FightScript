import { ChildProcess, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { google } from 'googleapis'
import { register } from 'ts-node'

interface ChessMove {
  from: string
  to: string
  promotion?: string
}

interface GameState {
  isGameOver: boolean;
  winner?: number;
  reason?: string;
}

export class ChessEngine {
  private stockfish: ChildProcess | null = null
  private drive: any
  private isReady: boolean = false
  private enginePath: string

  constructor() {
    try {
      // Register ts-node to handle TypeScript files
      register()
      
      // Update path with correct Stockfish executable name
      this.enginePath = path.join(
        process.cwd(),
        'src',
        'engine',
        'stockfish',
        'stockfish-windows-x86-64-avx2.exe'
      )

      // Check if engine exists
      if (!fs.existsSync(this.enginePath)) {
        // Create directory if it doesn't exist
        const engineDir = path.dirname(this.enginePath)
        if (!fs.existsSync(engineDir)) {
          fs.mkdirSync(engineDir, { recursive: true })
        }
        throw new Error(`Stockfish engine not found at: ${this.enginePath}`)
      }

      // Initialize Stockfish
      this.initializeEngine()
    } catch (error) {
      console.error('Failed to initialize chess engine:', error)
      throw error
    }
  }

  private initializeEngine(): void {
    try {
      this.stockfish = spawn(this.enginePath)
      
      if (!this.stockfish?.stdin || !this.stockfish?.stdout) {
        throw new Error('Failed to spawn chess engine process')
      }

      this.stockfish.on('error', (error: Error) => {
        console.error('Chess engine error:', error)
        this.cleanup()
      })

      this.stockfish.on('exit', (code: number) => {
        console.log(`Chess engine exited with code ${code}`)
      })

      // Initialize UCI mode
      this.stockfish.stdin.write('uci\n')
      this.stockfish.stdin.write('setoption name MultiPV value 1\n')
      this.stockfish.stdin.write('isready\n')

      // Wait for engine to be ready
      this.waitForReady()
    } catch (error) {
      console.error('Failed to initialize engine:', error)
      throw error
    }
  }

  private checkStockfish(): void {
    if (!this.stockfish?.stdin || !this.stockfish?.stdout) {
      throw new Error('Chess engine not properly initialized');
    }
  }

  private waitForReady(): Promise<void> {
    this.checkStockfish();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Engine initialization timeout'));
      }, 5000);

      const handler = (data: Buffer) => {
        if (data.toString().includes('readyok')) {
          this.isReady = true;
          clearTimeout(timeout);
          this.stockfish!.stdout!.removeListener('data', handler);
          resolve();
        }
      };

      try {
        this.stockfish!.stdout!.on('data', handler);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async getEngineInfo(): Promise<{ version: string; ready: boolean; cores: number }> {
    return new Promise((resolve) => {
      let version = ''
      let cores = 1
      let ready = false

      const handler = (data: Buffer) => {
        const output = data.toString()
        
        // Get version info
        if (output.includes('Stockfish')) {
          version = output.split('\n')[0].trim()
        }
        
        // Get CPU cores
        if (output.includes('threads')) {
          cores = parseInt(output.match(/threads\s+(\d+)/)?.[1] || '1')
        }

        // Check if engine is ready
        if (output.includes('readyok')) {
          ready = true
          this.stockfish?.stdout?.removeListener('data', handler)
          resolve({ version, ready, cores })
        }
      }

      this.stockfish?.stdout?.on('data', handler)
      
      // Send commands to get info
      this.stockfish?.stdin?.write('uci\n')
      this.stockfish?.stdin?.write('setoption name Threads value 4\n')
      this.stockfish?.stdin?.write('isready\n')
    })
  }

  async evaluatePosition(fen: string, timeLimit: number = 1000): Promise<{
    isGameOver: boolean;
    winner: number;
    reason: string;
    bestMove?: string;
  }> {
    this.checkStockfish();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Evaluation timeout'));
      }, timeLimit + 1000);

      let bestMove = '';
      let isGameOver = false;
      let winner = 0;
      let reason = '';

      const handler = (data: Buffer) => {
        const output = data.toString();
        
        if (output.includes('mate 0')) {
          isGameOver = true;
          winner = output.includes('White') ? 1 : 2;
          reason = 'Checkmate';
        } else if (output.includes('stalemate')) {
          isGameOver = true;
          winner = 0;
          reason = 'Stalemate';
        } else if (output.includes('bestmove')) {
          clearTimeout(timeout);
          this.stockfish!.stdout!.removeListener('data', handler);
          bestMove = output.split('bestmove ')[1].split(' ')[0];
          resolve({
            isGameOver,
            winner,
            reason,
            bestMove
          });
        }
      };

      try {
        this.stockfish!.stdout!.on('data', handler);
        this.stockfish!.stdin!.write(`position fen ${fen}\n`);
        this.stockfish!.stdin!.write(`go movetime ${timeLimit}\n`);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async downloadAgent(fileId: string): Promise<string> {
    const tempPath = path.join(process.cwd(), 'temp', `${fileId}.js`)
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.dirname(tempPath))) {
      fs.mkdirSync(path.dirname(tempPath), { recursive: true })
    }

    // Download file from Google Drive
    const dest = fs.createWriteStream(tempPath)
    const response = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )
    
    await new Promise((resolve, reject) => {
      response.data
        .on('end', resolve)
        .on('error', reject)
        .pipe(dest)
    })

    return tempPath
  }

  async runMatch(bot1Path: string, bot2Path: string): Promise<{
    winner: number;
    reason: string;
    moves: string[];
  }> {
    let bot1: any = null;
    let bot2: any = null;  // Declare bots at function scope

    try {
      console.log('Starting bots...');
      bot1 = spawn(bot1Path, [], { stdio: ['pipe', 'pipe', 'pipe'] });
      bot2 = spawn(bot2Path, [], { stdio: ['pipe', 'pipe', 'pipe'] });

      // Initialize UCI mode for both bots
      console.log('Initializing bots...');
      bot1.stdin.write('uci\n');
      bot2.stdin.write('uci\n');
      bot1.stdin.write('isready\n');
      bot2.stdin.write('isready\n');

      let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      let moves: string[] = [];
      let currentPlayer = 1;
      let moveCount = 0;

      // Wait for both bots to be ready
      await Promise.all([
        this.waitForBotReady(bot1, "Bot 1"),
        this.waitForBotReady(bot2, "Bot 2")
      ]);

      while (moveCount < 50) {
        const currentBot = currentPlayer === 1 ? bot1 : bot2;
        const botName = currentPlayer === 1 ? "Bot 1" : "Bot 2";
        
        console.log(`\nTurn ${moveCount + 1}, ${botName}'s move`);
        console.log('Position:', currentFen);

        try {
          // Get move from current bot
          currentBot.stdin.write(`position fen ${currentFen}\n`);
          currentBot.stdin.write('go movetime 1000\n');

          const move = await this.getBotMove(currentBot, botName);
          console.log(`${botName} plays: ${move}`);

          // Validate move format
          if (!this.isValidMove(move)) {
            console.log(`Invalid move format from ${botName}: ${move}`);
            return {
              winner: currentPlayer === 1 ? 2 : 1,
              reason: 'Invalid move format',
              moves
            };
          }

          // Update game state
          moves.push(move);
          
          // Update FEN using Stockfish
          this.stockfish?.stdin?.write(`position fen ${currentFen} moves ${move}\n`);
          this.stockfish?.stdin?.write('d\n');

          // Get new position
          currentFen = await this.getNewPosition();

          // Check game state
          const gameState = await this.evaluatePosition(currentFen);
          if (gameState.isGameOver) {
            return {
              winner: gameState.winner,
              reason: gameState.reason,
              moves
            };
          }

          moveCount++;
          currentPlayer = currentPlayer === 1 ? 2 : 1;

        } catch (error) {
          console.error(`Error during ${botName}'s turn:`, error);
          return {
            winner: currentPlayer === 1 ? 2 : 1,
            reason: `Bot error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            moves
          };
        }
      }

      return {
        winner: 0,
        reason: 'Draw by move limit',
        moves
      };

    } catch (error) {
      console.error('Match failed:', error);
      throw error;
    } finally {
      // Cleanup bots
      if (bot1) {
        try {
          bot1.stdin.write('quit\n');
          bot1.kill();
        } catch (error) {
          console.error('Error cleaning up bot1:', error);
        }
      }
      if (bot2) {
        try {
          bot2.stdin.write('quit\n');
          bot2.kill();
        } catch (error) {
          console.error('Error cleaning up bot2:', error);
        }
      }
    }
  }

  private waitForBotReady(bot: any, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${name} initialization timeout`));
      }, 5000);

      const handler = (data: Buffer) => {
        const output = data.toString();
        if (output.includes('uciok')) {
          bot.stdout.removeListener('data', handler);
          clearTimeout(timeout);
          resolve();
        }
      };

      bot.stdout.on('data', handler);
    });
  }

  private getBotMove(bot: any, botName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${botName} move timeout`));
      }, 5000);

      const moveHandler = (data: Buffer) => {
        const output = data.toString();
        if (output.includes('bestmove')) {
          clearTimeout(timeout);
          bot.stdout.removeListener('data', moveHandler);
          const move = output.split('bestmove ')[1].split(' ')[0].trim();
          if (move && move !== '(none)') {
            resolve(move);
          } else {
            reject(new Error(`${botName} returned invalid move`));
          }
        }
      };

      bot.stdout.on('data', moveHandler);
    });
  }

  private getNewPosition(): Promise<string> {
    this.checkStockfish();

    return new Promise((resolve) => {
      const handler = (data: Buffer) => {
        const output = data.toString();
        if (output.includes('Fen: ')) {
          this.stockfish!.stdout!.removeListener('data', handler);
          const newFen = output.split('Fen: ')[1].split('\n')[0].trim();
          resolve(newFen);
        }
      };
      this.stockfish!.stdout!.on('data', handler);
    });
  }

  private isValidMove(move: string): boolean {
    // Validate move format (e.g., "e2e4")
    return /^[a-h][1-8][a-h][1-8]$/.test(move)
  }

  private updatePosition(fen: string, move: string): string {
    // Simple position update (in real implementation, use Stockfish for this)
    return fen; // Placeholder
  }

  private cleanupBot(bot: any) {
    try {
      bot.stdin.write('quit\n');
      bot.kill();
    } catch (error) {
      console.error('Error cleaning up bot:', error);
    }
  }

  cleanup() {
    try {
      if (this.stockfish?.stdin) {
        this.stockfish.stdin.write('quit\n')
      }
      if (this.stockfish) {
        this.stockfish.kill()
        this.stockfish = null
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  public async runGame(agent1FileId: string, agent2FileId: string): Promise<{
    winner: number;
    reason: string;
    moves: string[];
  }> {
    let bot1: ChildProcess | null = null;
    let bot2: ChildProcess | null = null;

    try {
      bot1 = await this.initializeBot(agent1FileId);
      bot2 = await this.initializeBot(agent2FileId);

      let currentPosition = 'startpos';
      const moves: string[] = [];
      let currentPlayer = 1;
      let moveCount = 0;

      while (moveCount < 100) {
        const currentBot = currentPlayer === 1 ? bot1 : bot2;
        if (!currentBot) {
          throw new Error(`Bot ${currentPlayer} not initialized`);
        }
        
        try {
          const move = await this.getMoveWithTimeout(currentBot, currentPosition);
          
          if (!this.isValidMove(move)) {
            return {
              winner: currentPlayer === 1 ? 2 : 1,
              reason: `Invalid move by player ${currentPlayer}`,
              moves
            };
          }

          moves.push(move);
          
          if (!this.stockfish?.stdin) {
            throw new Error('Chess engine not initialized');
          }
          
          this.stockfish.stdin.write(`position fen ${currentPosition} moves ${move}\n`);
          this.stockfish.stdin.write('d\n');
          
          currentPosition = await this.getNewPosition();
          
          const gameState = await this.evaluatePosition(currentPosition);
          if (gameState.isGameOver) {
            return {
              winner: gameState.winner || 0,
              reason: gameState.reason || 'Game Over',
              moves
            };
          }

          currentPlayer = currentPlayer === 1 ? 2 : 1;
          moveCount++;
        } catch (err) {
          const error = err as Error;
          return {
            winner: currentPlayer === 1 ? 2 : 1,
            reason: `Player ${currentPlayer} failed to make a move: ${error.message}`,
            moves
          };
        }
      }

      return {
        winner: 0,
        reason: 'Game exceeded maximum moves',
        moves
      };
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to run game: ${error.message}`);
    } finally {
      if (bot1?.stdin) bot1.stdin.write('quit\n');
      if (bot2?.stdin) bot2.stdin.write('quit\n');
      if (bot1) bot1.kill();
      if (bot2) bot2.kill();
    }
  }

  private async getMoveWithTimeout(bot: ChildProcess, position: string): Promise<string> {
    if (!bot.stdin || !bot.stdout) {
      throw new Error('Bot process not properly initialized');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Move timeout'));
      }, 5000);

      const moveHandler = (data: Buffer) => {
        const move = data.toString().trim();
        if (this.isValidMove(move)) {
          clearTimeout(timeout);
          bot.stdout!.removeListener('data', moveHandler);
          resolve(move);
        }
      };

      try {
        bot.stdout!.on('data', moveHandler);
        bot.stdin!.write(`position ${position}\n`);
        bot.stdin!.write('go movetime 1000\n');
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async initializeBot(agentPath: string): Promise<ChildProcess> {
    const bot = spawn(agentPath);
    
    if (!bot.stdin || !bot.stdout) {
      throw new Error('Failed to initialize bot process');
    }

    try {
      bot.stdin.write('uci\n');
      bot.stdin.write('isready\n');
    } catch (error) {
      bot.kill();
      throw error;
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        bot.kill();
        reject(new Error('Bot initialization timeout'));
      }, 5000);

      const handler = (data: Buffer) => {
        if (data.toString().includes('readyok')) {
          clearTimeout(timeout);
          bot.stdout?.removeListener('data', handler);
          resolve(bot);
        }
      };

      try {
        bot.stdout.on('data', handler);
        bot.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      } catch (error) {
        clearTimeout(timeout);
        bot.kill();
        reject(error);
      }
    });
  }
} 