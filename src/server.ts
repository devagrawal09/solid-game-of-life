"use server";

const GRID_SIZE = 50;

type Cell = {
  alive: boolean;
  color?: string;
};

type CellChange = {
  x: number;
  y: number;
  cell: Cell;
};

type GridUpdate =
  | {
      type: "full";
      data: Cell[][];
    }
  | {
      type: "changes";
      data: CellChange[];
    };

// Global simulation state
let globalGrid = createInterestingPattern();
let subscribers = new Set<(update: GridUpdate) => void>();

function createEmptyGrid(): Cell[][] {
  return Array(GRID_SIZE)
    .fill(0)
    .map(() =>
      Array(GRID_SIZE)
        .fill(0)
        .map(() => ({ alive: false }))
    );
}

function countNeighbors(grid: Cell[][], x: number, y: number) {
  let count = 0;
  let colors = new Map<string, number>();

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newX = x + i;
      const newY = y + j;
      if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        const cell = grid[newX][newY];
        if (cell.alive) {
          count++;
          if (cell.color) {
            colors.set(cell.color, (colors.get(cell.color) || 0) + 1);
          }
        }
      }
    }
  }
  return { count, colors };
}

function nextGeneration(grid: Cell[][]) {
  const newGrid = createEmptyGrid();
  const changes: CellChange[] = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const { count, colors } = countNeighbors(grid, i, j);
      const currentCell = grid[i][j];

      // Determine if cell lives or dies
      let willLive = false;
      if (currentCell.alive && (count === 2 || count === 3)) {
        willLive = true;
      } else if (!currentCell.alive && count === 3) {
        willLive = true;
      }

      // If cell will live, determine its color
      if (willLive) {
        let newColor = currentCell.color;
        if (!currentCell.alive || count >= 2) {
          // New cell or cell with multiple neighbors - inherit most common neighbor color
          const sortedColors = Array.from(colors.entries()).sort(
            (a, b) => b[1] - a[1]
          );
          if (sortedColors.length > 0) {
            newColor = sortedColors[0][0];
          }
        }
        newGrid[i][j] = { alive: true, color: newColor };

        // Check if cell changed
        if (!currentCell.alive || currentCell.color !== newColor) {
          changes.push({ x: i, y: j, cell: newGrid[i][j] });
        }
      } else {
        newGrid[i][j] = { alive: false };
        if (currentCell.alive) {
          changes.push({ x: i, y: j, cell: newGrid[i][j] });
        }
      }
    }
  }

  return { newGrid, changes };
}

function createInterestingPattern() {
  const grid = createEmptyGrid();

  // All coordinates from the provided list
  const coords = [
    [4, 12],
    [4, 44],
    [5, 11],
    [5, 13],
    [5, 43],
    [5, 44],
    [5, 45],
    [6, 11],
    [6, 13],
    [6, 44],
    [7, 12],
    [9, 7],
    [9, 8],
    [9, 16],
    [9, 17],
    [9, 18],
    [10, 6],
    [10, 12],
    [10, 17],
    [10, 23],
    [11, 6],
    [11, 10],
    [11, 12],
    [11, 17],
    [11, 22],
    [11, 23],
    [12, 6],
    [12, 10],
    [12, 12],
    [12, 17],
    [12, 22],
    [12, 23],
    [13, 7],
    [13, 8],
    [13, 16],
    [13, 17],
    [13, 18],
    [15, 16],
    [15, 17],
    [16, 15],
    [16, 16],
    [16, 17],
    [17, 15],
    [17, 16],
    [17, 17],
    [18, 24],
    [19, 11],
    [19, 12],
    [19, 23],
    [20, 24],
    [20, 25],
    [22, 2],
    [23, 2],
    [24, 1],
    [24, 3],
    [24, 31],
    [24, 32],
    [25, 1],
    [26, 0],
    [26, 4],
    [26, 25],
    [27, 0],
    [27, 25],
    [27, 32],
    [28, 4],
    [28, 24],
    [28, 30],
    [28, 31],
    [29, 24],
    [29, 30],
    [29, 31],
    [30, 4],
    [30, 24],
    [30, 30],
    [30, 31],
    [31, 24],
    [31, 30],
    [31, 31],
    [33, 17],
    [34, 16],
    [34, 17],
    [35, 16],
    [35, 17],
    [36, 17],
    [38, 22],
    [38, 23],
    [39, 22],
    [39, 23],
    [39, 31],
    [40, 22],
    [40, 23],
    [40, 30],
    [40, 32],
    [41, 30],
    [41, 32],
    [43, 31],
    [44, 31],
    [45, 30],
    [45, 32],
    [46, 22],
    [46, 23],
    [46, 30],
    [46, 32],
    [47, 22],
    [47, 23],
    [47, 31],
  ];

  // Define regions for different colors
  const regions = {
    blue: (x: number, y: number) => x < 8, // Top patterns
    green: (x: number, y: number) => x >= 9 && x < 14 && y < 15, // Left middle patterns
    orange: (x: number, y: number) => x >= 15 && x < 21, // Center patterns
    purple: (x: number, y: number) => x >= 22 && x < 32, // Bottom left patterns
    red: (x: number, y: number) => x >= 33, // Bottom right patterns
  };

  // Add all positions to the grid with their colors based on regions
  coords.forEach(([x, y]) => {
    if (x < GRID_SIZE && y < GRID_SIZE) {
      let color = "#000000"; // Default black
      if (regions.blue(x, y)) color = "#0000FF";
      else if (regions.green(x, y)) color = "#00FF00";
      else if (regions.orange(x, y)) color = "#FFA500";
      else if (regions.purple(x, y)) color = "#800080";
      else if (regions.red(x, y)) color = "#FF0000";

      grid[x][y] = { alive: true, color };
    }
  });

  return grid;
}

// Notify all subscribers of a grid change
function notifySubscribers(update: GridUpdate) {
  subscribers.forEach((callback) => callback(update));
}

// Run the simulation continuously
async function runSimulation() {
  while (true) {
    const { newGrid, changes } = nextGeneration(globalGrid);
    if (changes.length > 0) {
      globalGrid = newGrid;
      notifySubscribers({ type: "changes", data: changes });
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Start the simulation
runSimulation();

export async function* gameOfLife(): AsyncGenerator<GridUpdate, void, unknown> {
  let lastUpdate: GridUpdate | null = null;

  const callback = (update: GridUpdate) => {
    lastUpdate = update;
  };
  subscribers.add(callback);

  try {
    // Yield initial full grid
    yield { type: "full" as const, data: globalGrid };

    // Wait for updates
    while (true) {
      lastUpdate = null;
      await new Promise<void>((resolve) => {
        const updateCallback = (update: GridUpdate) => {
          lastUpdate = update;
          resolve();
        };
        subscribers.add(updateCallback);
        setTimeout(resolve, 1000); // Timeout in case no update comes
      });
      subscribers.delete(callback);

      if (lastUpdate) {
        yield lastUpdate;
      }
    }
  } finally {
    subscribers.delete(callback);
  }
}

export async function getInitialGrid() {
  return globalGrid;
}

export async function toggleCell(x: number, y: number) {
  const currentCell = globalGrid[x][y];
  const newCell = currentCell.alive
    ? { alive: false }
    : {
        alive: true,
        color: ["#0000FF", "#FFA500", "#00FF00", "#800080"][
          Math.floor(Math.random() * 4)
        ],
      };

  globalGrid[x][y] = newCell;
  notifySubscribers({
    type: "changes",
    data: [{ x, y, cell: newCell }],
  });

  return globalGrid;
}

export async function resetGrid() {
  globalGrid = createInterestingPattern();
  notifySubscribers({ type: "full", data: globalGrid });
  return globalGrid;
}
