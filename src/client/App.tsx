import { Devvit } from '@devvit/public-api';
import { BOARD_SIZE, TileType, PATH, BOARD_KEY } from '../shared/types'; // Import from shared types

Devvit.addCustomPostType({
  name: 'PixelTowerGame', // Unique identifier for your custom post type
  render: ({ useState, useAsync, useInterval }) => {
    // --- State for the UI ---
    // boardData holds the current visual state of the game board
    const [boardData, setBoardData] = useState<TileType[][] | null>(null);
    // statusMessage provides feedback to the user
    const [statusMessage, setStatusMessage] = useState<string>('');

    // --- Function to fetch the latest board state from KVStore ---
    const fetchBoard = async () => {
      try {
        const fetchedBoard: TileType[][] | undefined = await Devvit.kvStore.get(BOARD_KEY);
        if (fetchedBoard) {
          setBoardData(fetchedBoard);
          setStatusMessage(''); // Clear status on successful fetch
        } else {
          // This scenario might happen before the very first scheduler run
          setStatusMessage("Game initializing... Please wait for the first game tick.");
        }
      } catch (error) {
        console.error("Error fetching board:", error);
        setStatusMessage("Failed to load board. Please try refreshing.");
      }
    };

    // --- Initial Load: Fetch board once when component mounts ---
    useAsync(fetchBoard, []);

    // --- Auto-refresh: Poll KVStore to reflect scheduler updates or other players' actions ---
    // Refreshes the board data every 5 seconds. This is crucial for a "live" feel.
    useInterval(fetchBoard, 5000); // Fetch every 5 seconds

    // --- Event Handler: User clicks to place a Tower ---
    const placeTower = async (x: number, y: number) => {
      if (!boardData) {
        setStatusMessage("Board not loaded. Please wait.");
        return;
      }

      // Fetch the absolute latest board state from KVStore to avoid stale data
      let currentBoardFromKV: TileType[][] | undefined = await Devvit.kvStore.get(BOARD_KEY);
      if (!currentBoardFromKV) {
        setStatusMessage("Failed to get latest board state for placing tower.");
        return;
      }

      // Check if the clicked tile is valid for tower placement
      if (currentBoardFromKV[y][x] === TileType.GRASS) {
        currentBoardFromKV[y][x] = TileType.TOWER; // Place tower in the backend state
        await Devvit.kvStore.put(BOARD_KEY, currentBoardFromKV); // Save updated state
        await fetchBoard(); // Immediately re-fetch and update UI
        setStatusMessage(`Tower placed at (${x},${y})!`);
      } else if (currentBoardFromKV[y][x] === TileType.PATH || currentBoardFromKV[y][x] === TileType.ENEMY || currentBoardFromKV[y][x] === TileType.TOWER) {
        setStatusMessage("Towers can only be built on empty grass!");
      }
    };

    // --- Helper function to render the correct emoji for each tile type ---
    const renderTile = (tile: TileType) => {
      switch (tile) {
        case TileType.GRASS: return '🟩'; // Green Square
        case TileType.PATH: return '⬛'; // Black Square
        case TileType.ENEMY: return '👾'; // Alien Monster
        case TileType.TOWER: return '🗼'; // Tokyo Tower emoji for a tower
        default: return '❓'; // Unknown tile
      }
    };

    // --- UI Rendering ---
    if (!boardData) {
      return (
        <vstack padding="medium" alignment="center">
          <text style="heading">Loading Pixel Tower...</text>
          {statusMessage && <text>{statusMessage}</text>}
        </vstack>
      );
    }

    return (
      <vstack padding="medium" gap="small" alignment="center">
        <text style="heading">Pixel Tower 🗼</text>
        <text style="subtext">Vote. Build. Defend. (Board refreshes every 5s)</text>
        {statusMessage && <text>{statusMessage}</text>}

        <vstack border="thin" borderColor="neutral" cornerRadius="medium" padding="xsmall">
          {boardData.map((row, y) => (
            <hstack gap="xsmall">
              {row.map((tile, x) => (
                <button
                  onPress={() => placeTower(x, y)}
                  size="small"
                  appearance="secondary"
                // Optionally, you could dynamically change button style based on `tile`
                // to make non-grass tiles look non-clickable. For MVP, keep it simple.
                >
                  <text>{renderTile(tile)}</text>
                </button>
              ))}
            </hstack>
          ))}
        </vstack>
        {/* Manual Refresh button is commented out as useInterval handles automatic refresh now */}
        {/* <button onPress={fetchBoard}><text>Refresh Board (Manual)</text></button> */}
      </vstack>
    );
  },
});