// --- Game Configuration ---
export const BOARD_SIZE = 10; // 10x10 grid

// Define your path here as an array of {x, y} coordinates.
// Ensure these coordinates are within the BOARD_SIZE (0-9 for a 10x10 board).
// The path should be continuous.
export const PATH = [
    { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
    { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 },
    { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
    { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 },
    { x: 8, y: 8 }, { x: 9, y: 8 } // End of the path
];

// --- Board Tile Types ---
// Using an enum for clarity and type safety
export enum TileType {
    GRASS = 0,
    PATH = 1,
    ENEMY = 2,
    TOWER = 3
}

// --- KVStore Keys ---
// Keys used to store/retrieve game state in Devvit's Key-Value Store
export const BOARD_KEY = 'pixelTowerBoard';
export const ENEMY_POSITION_INDEX_KEY = 'pixelTowerEnemyPosIndex';