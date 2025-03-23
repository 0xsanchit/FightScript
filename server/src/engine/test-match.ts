import { ChessEngine } from './chess-engine';
import path from 'path';
import fs from 'fs';

async function runTestMatch() {
  let engine: ChessEngine | null = null;
  
  try {
    // Check if agents exist
    const agent1Path = path.join(__dirname, 'agents', 'random-agent.ts');
    const agent2Path = path.join(__dirname, 'agents', 'aggressive-agent.ts');

    if (!fs.existsSync(agent1Path)) {
      throw new Error(`Agent 1 not found at: ${agent1Path}`);
    }
    if (!fs.existsSync(agent2Path)) {
      throw new Error(`Agent 2 not found at: ${agent2Path}`);
    }

    // Initialize engine
    engine = new ChessEngine();
    
    // Get engine info
    const engineInfo = await engine.getEngineInfo();
    console.log('Engine Status:', engineInfo);

    console.log('\nStarting match: Random Agent vs Aggressive Agent');
    
    const result = await engine.runGame(agent1Path, agent2Path);

    console.log('\nMatch Result:');
    console.log('Winner:', result.winner === 1 ? 'Random Agent' : 'Aggressive Agent');
    console.log('Reason:', result.reason);
    console.log('\nMoves played:');
    result.moves.forEach((move, index) => {
      console.log(`${index + 1}. ${move}`);
    });

  } catch (error) {
    console.error('Test match failed:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    if (engine) {
      engine.cleanup();
    }
  }
}

// Run the test match
runTestMatch().catch(error => {
  console.error('Fatal error:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
}); 