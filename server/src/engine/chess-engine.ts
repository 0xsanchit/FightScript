import { ChildProcess, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { google } from 'googleapis'

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
  private process: ChildProcess | null = null
  private drive: any
  private isReady: boolean = false

  cleanup(): void {
    if (this.process) {
      this.process.kill()
      this.process = null
      this.isReady = false
    }
  }

  async runMatch(bot1Path: string, bot2Path: string): Promise<{
    winner: number;
    reason: string;
    moves: string[];
    engineOutput?: string;
  }> {
    console.log(bot1Path);
    console.log(bot2Path);
    const pythonScript = path.join(__dirname, 'engine.py');
  
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [pythonScript, bot1Path, bot2Path]);
      
      let output = '';
      let errorOutput = '';
  
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Error: ${data}`);
      });
  
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          reject(new Error(`Python process failed with code ${code}: ${errorOutput}`));
          return;
        }
  
        try {
          // Parse the output from your Python script
          const lines = output.trim().split('\n');
          
          if (lines.length === 0) {
            reject(new Error('No output received from Python script'));
            return;
          }
  
          const result = lines[0];
          const pgn = lines.slice(1).join('\n');
          
          console.log('Match Result:', result);
          console.log('PGN Output:', pgn);
  
          // Parse the result - adjust this based on your Python script's output format
          // Example assumes format like "winner:1,reason:checkmate" or similar
          let winner = parseInt(result);
          let reason = 'Unknown';
          let moves: string[] = [];
  
          // You'll need to adjust this parsing based on your actual Python output format
          // if (result.includes('winner')) {
          //   // Example parsing - modify based on your actual format
          //   const parts = result.split(',');
          //   for (const part of parts) {
          //     const [key, value] = part.split(':');
          //     if (key === 'winner') {
          //       winner = parseInt(value) || 0;
          //     } else if (key === 'reason') {
          //       reason = value || 'Unknown';
          //     }
          //   }
          // }
  
          // Extract moves from PGN if needed
          // This is a simple example - you might need more sophisticated PGN parsing
          if (pgn) {
            const moveMatches = pgn.match(/\d+\.\s*([a-zA-Z0-9+#=\-]+)\s*([a-zA-Z0-9+#=\-]+)?/g);
            if (moveMatches) {
              moves = moveMatches.flatMap(match => {
                const parts = match.replace(/\d+\.\s*/, '').split(/\s+/);
                return parts.filter(part => part.trim());
              });
            }
          }
          
          resolve({
            winner,
            reason,
            moves,
            engineOutput: ""
          });
  
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error}`));
        }
      });
  
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }
}

// Export a singleton instance
export const chessEngine = new ChessEngine(); 