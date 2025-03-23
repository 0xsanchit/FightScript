import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { google } from 'googleapis'
import { register } from 'ts-node'

interface ChessMove {
  from: string
  to: string
  promotion?: string
}

export class ChessEngine {
  private engine: any
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
        throw new Error(`Stockfish engine not found at: ${this.enginePath}. Please download Stockfish and place it in the correct location.`)
      }

      // Initialize Stockfish
      this.engine = spawn(this.enginePath)
      
      // Set up error handling for the engine process
      this.engine.on('error', (error: Error) => {
        console.error('Chess engine error:', error)
        this.cleanup()
      })

      this.engine.on('exit', (code: number) => {
        console.log(`Chess engine exited with code ${code}`)
      })

      // Initialize UCI mode
      this.engine.stdin.write('uci\n')
      this.engine.stdin.write('setoption name MultiPV value 1\n')
      this.engine.stdin.write('isready\n')

      // Wait for engine to be ready
      this.waitForReady()
    } catch (error) {
      console.error('Failed to initialize chess engine:', error)
      throw error
    }
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const handler = (data: Buffer) => {
        if (data.toString().includes('readyok')) {
          this.isReady = true
          this.engine.stdout.removeListener('data', handler)
          resolve()
        }
      }
      this.engine.stdout.on('data', handler)
    })
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
          this.engine.stdout.removeListener('data', handler)
          resolve({ version, ready, cores })
        }
      }

      this.engine.stdout.on('data', handler)
      
      // Send commands to get info
      this.engine.stdin.write('uci\n')
      this.engine.stdin.write('setoption name Threads value 4\n')
      this.engine.stdin.write('isready\n')
    })
  }

  async evaluatePosition(fen: string, timeLimit: number = 1000): Promise<{
    isGameOver: boolean;
    winner: number;
    reason: string;
    bestMove?: string;
  }> {
    return new Promise((resolve) => {
      let bestMove = ''
      let isGameOver = false
      let winner = 0
      let reason = ''

      const handler = (data: Buffer) => {
        const output = data.toString()
        
        if (output.includes('mate 0')) {
          isGameOver = true
          winner = output.includes('White') ? 1 : 2
          reason = 'Checkmate'
        } else if (output.includes('stalemate')) {
          isGameOver = true
          winner = 0
          reason = 'Stalemate'
        } else if (output.includes('bestmove')) {
          bestMove = output.split('bestmove ')[1].split(' ')[0]
          this.engine.stdout.removeListener('data', handler)
          resolve({
            isGameOver,
            winner,
            reason,
            bestMove
          })
        }
      }

      this.engine.stdout.on('data', handler)
      this.engine.stdin.write(`position fen ${fen}\n`)
      this.engine.stdin.write(`go movetime ${timeLimit}\n`)
    })
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

  async runGame(agent1Path: string, agent2Path: string): Promise<{
    winner: number;
    reason: string;
    moves: string[];
  }> {
    // Wait for engine to be ready before starting game
    if (!this.isReady) {
      await this.waitForReady()
    }

    try {
      // Import agents
      const agent1 = require(agent1Path)
      const agent2 = require(agent2Path)

      // Initialize game
      let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      let moves: string[] = []
      let currentPlayer = 1
      let moveCount = 0

      console.log('Starting new game...')

      while (moveCount < 50) { // Limit to 50 moves per player
        try {
          const currentAgent = currentPlayer === 1 ? agent1 : agent2
          const agentName = currentPlayer === 1 ? 'Agent 1' : 'Agent 2'
          
          console.log(`\nPosition: ${currentFen}`)
          console.log(`${agentName}'s turn...`)
          
          const move = await Promise.race([
            currentAgent.getMove(currentFen),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Move timeout')), 10000)
            )
          ])

          if (!move || typeof move !== 'string') {
            throw new Error('Invalid move format')
          }

          console.log(`${agentName} plays: ${move}`)

          // Validate move
          const isValid = await this.validateMove(currentFen, move)
          if (!isValid) {
            console.log(`Invalid move by ${agentName}: ${move}`)
            return {
              winner: currentPlayer === 1 ? 2 : 1,
              reason: 'Invalid move',
              moves
            }
          }

          moves.push(move)
          currentFen = await this.getNewPosition(currentFen, move)
          
          // Check for checkmate or stalemate
          const gameState = await this.evaluatePosition(currentFen)
          if (gameState.isGameOver) {
            return {
              winner: gameState.winner,
              reason: gameState.reason,
              moves
            }
          }

          currentPlayer = currentPlayer === 1 ? 2 : 1
          moveCount++

        } catch (error) {
          console.error(`Error during ${currentPlayer === 1 ? 'Agent 1' : 'Agent 2'}'s turn:`, error)
          return {
            winner: currentPlayer === 1 ? 2 : 1,
            reason: `Agent error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            moves
          }
        }
      }

      return {
        winner: 0,
        reason: 'Draw by move limit',
        moves
      }

    } catch (error) {
      throw new Error(`Game failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async validateMove(fen: string, move: string): Promise<boolean> {
    return new Promise((resolve) => {
      let validMoves: string[] = []
      
      const handler = (data: Buffer) => {
        const output = data.toString()
        if (output.includes('bestmove')) {
          this.engine.stdout.removeListener('data', handler)
          resolve(validMoves.includes(move))
        } else if (output.includes('info')) {
          const matches = output.match(/pv\s([a-h][1-8][a-h][1-8])/g)
          if (matches) {
            validMoves = matches.map(m => m.split(' ')[1])
          }
        }
      }

      this.engine.stdout.on('data', handler)
      this.engine.stdin.write(`position fen ${fen}\n`)
      this.engine.stdin.write('go depth 1\n')
    })
  }

  async getNewPosition(fen: string, move: string): Promise<string> {
    return new Promise((resolve) => {
      const handler = (data: Buffer) => {
        const output = data.toString()
        if (output.includes('Fen: ')) {
          this.engine.stdout.removeListener('data', handler)
          const newFen = output.split('Fen: ')[1].split('\n')[0]
          resolve(newFen)
        }
      }

      this.engine.stdout.on('data', handler)
      this.engine.stdin.write(`position fen ${fen} moves ${move}\n`)
      this.engine.stdin.write('d\n')
    })
  }

  private isValidMove(move: ChessMove): boolean {
    const validSquares = /^[a-h][1-8]$/
    return (
      validSquares.test(move.from) &&
      validSquares.test(move.to) &&
      (!move.promotion || 'qrbn'.includes(move.promotion.toLowerCase()))
    )
  }

  private convertToUCI(move: ChessMove): string {
    let uci = `${move.from}${move.to}`
    if (move.promotion) {
      uci += move.promotion.toLowerCase()
    }
    return uci
  }

  private async evaluateGameState(fen: string): Promise<{
    isOver: boolean
    winner: number
    reason: string
  }> {
    // Check for checkmate, stalemate, insufficient material, etc.
    return new Promise((resolve) => {
      this.engine.stdin.write(`position fen ${fen}\n`)
      this.engine.stdin.write('eval\n')

      this.engine.stdout.on('data', (data: Buffer) => {
        const output = data.toString()
        
        if (output.includes('mate 0')) {
          resolve({
            isOver: true,
            winner: output.includes('White') ? 1 : 2,
            reason: 'Checkmate'
          })
        } else if (output.includes('stalemate')) {
          resolve({
            isOver: true,
            winner: 0,
            reason: 'Stalemate'
          })
        } else {
          resolve({
            isOver: false,
            winner: 0,
            reason: ''
          })
        }
      })
    })
  }

  cleanup() {
    try {
      this.engine.stdin.write('quit\n')
      this.engine.kill()
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }
} 