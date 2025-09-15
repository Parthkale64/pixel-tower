// --- Game Configuration ---
export const BOARD_SIZE = 10;
export const PATH = [
    { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
    { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 4 }, { x: 5, y: 5 },
    { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }
    // Define your path here! Make sure it's long enough for the enemy to move.
    // Example path. Ensure you adjust it for your 10x10 grid to avoid out-of-bounds.
    // I've added a few more steps to make it clearer the enemy will move along it.
];

// --- Board Tile Types ---
export enum TileType {
    GRASS = 0,
    PATH = 1,
    ENEMY = 2,
    TOWER = 3
}

// --- KVStore Keys ---
export const BOARD_KEY = 'pixelTowerBoard';
export const ENEMY_POSITION_KEY = 'pixelTowerEnemyPos';