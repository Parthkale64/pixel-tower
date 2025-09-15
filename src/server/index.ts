import { Devvit } from '@devvit/public-api';
import { BOARD_SIZE, TileType, PATH, BOARD_KEY, ENEMY_POSITION_INDEX_KEY } from '../shared/types';

// Helper function to create the initial board state
function createInitialBoardState(): TileType[][] {
  const board: TileType[][] = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(TileType.GRASS));

  // Draw the path
  for (const p of PATH) {
    if (p.y >= 0 && p.y < BOARD_SIZE && p.x >= 0 && p.x < BOARD_SIZE) {
      board[p.y][p.x] = TileType.PATH;
    }
  }

  // Place the initial enemy at the start of the path
  if (PATH.length > 0) {
    const startPos = PATH[0];
    if (startPos.y >= 0 && startPos.y < BOARD_SIZE && startPos.x >= 0 && startPos.x < BOARD_SIZE) {
      board[startPos.y][startPos.x] = TileType.ENEMY;
    }
  }
  return board;
}

// Register the scheduler job
Devvit.addSchedulerJob({
  name: 'pixelTowerGameTick', // Unique name for your scheduler job
  onRun: async (_, context) => {
    const { kvStore } = context;

    // 1. Get current game state from KVStore
    let currentBoard: TileType[][] | undefined = await kvStore.get(BOARD_KEY);
    let currentEnemyPosIndex: number | undefined = await kvStore.get(ENEMY_POSITION_INDEX_KEY);

    // Initialize if game state doesn't exist (first run or after a reset)
    if (!currentBoard || currentEnemyPosIndex === undefined || PATH.length === 0) {
      console.log('Pixel Tower: Initializing game state...');
      currentBoard = createInitialBoardState();
      currentEnemyPosIndex = 0;
      await kvStore.put(BOARD_KEY, currentBoard);
      await kvStore.put(ENEMY_POSITION_INDEX_KEY, currentEnemyPosIndex);
      return; // Game initialized, nothing to move yet on this tick
    }

    // Deep copy the board to ensure we modify a fresh object, not the cached one
    // This helps avoid unexpected state issues, especially when placing towers
    currentBoard = JSON.parse(JSON.stringify(currentBoard));

    // 2. Clear the old enemy position (if it was on the path)
    const oldEnemyPos = PATH[currentEnemyPosIndex];
    if (oldEnemyPos && currentBoard[oldEnemyPos.y][oldEnemyPos.x] === TileType.ENEMY) {
      currentBoard[oldEnemyPos.y][oldEnemyPos.x] = TileType.PATH; // Revert to path
    }

    // 3. Calculate next enemy position
    let nextEnemyPosIndex = currentEnemyPosIndex + 1;
    let newEnemyPos: { x: number; y: number } | undefined;

    if (nextEnemyPosIndex < PATH.length) {
      // Enemy moves to the next point on the path
      newEnemyPos = PATH[nextEnemyPosIndex];
      currentBoard[newEnemyPos.y][newEnemyPos.x] = TileType.ENEMY;
      currentEnemyPosIndex = nextEnemyPosIndex;
      console.log(`Pixel Tower: Enemy moved to (${newEnemyPos.x}, ${newEnemyPos.y}). Current index: ${currentEnemyPosIndex}`);
    } else {
      // Enemy reached the end of the path - Game Over or Reset
      console.log('Pixel Tower: Enemy reached end of path! Resetting game...');
      currentBoard = createInitialBoardState(); // Reset board
      currentEnemyPosIndex = 0; // Reset enemy position
      const resetEnemyPos = PATH[currentEnemyPosIndex];
      if (resetEnemyPos) {
        currentBoard[resetEnemyPos.y][resetEnemyPos.x] = TileType.ENEMY;
      }
    }

    // 4. Save updated game state to KVStore
    await kvStore.put(BOARD_KEY, currentBoard);
    await kvStore.put(ENEMY_POSITION_INDEX_KEY, currentEnemyPosIndex);
  },
  // Set interval for testing. Change to 'every hour' for submission.
  interval: 'every minute' // For quick testing during hackathon!
});