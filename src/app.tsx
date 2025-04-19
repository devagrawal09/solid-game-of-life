import { createSignal, For, onCleanup, onMount } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";
import { gameOfLife, getInitialGrid, toggleCell, resetGrid } from "./server";
import "./app.css";

const GRID_SIZE = 50;
const CELL_SIZE = 10; // pixels

type Cell = {
  alive: boolean;
  color?: string;
};

type CellChange = {
  x: number;
  y: number;
  cell: Cell;
};

type GridUpdate = {
  type: "full" | "changes";
  data: Cell[][] | CellChange[];
};

export default function App() {
  const [grid, setGrid] = createStore<Cell[][]>([]);
  let gameIterator: AsyncGenerator<GridUpdate, void, unknown> | null = null;

  const startGameLoop = async () => {
    const iterator = (await gameOfLife())[Symbol.asyncIterator]();
    gameIterator = iterator;

    try {
      while (true) {
        const result = await iterator.next();
        if (result.done) break;

        const update = result.value;
        const start = performance.now();
        if (update.type === "full") {
          setGrid(reconcile(update.data));
        } else if (update.type === "changes") {
          setGrid(
            produce((grid) => {
              update.data.forEach(({ x, y, cell }) => {
                grid[x][y] = cell;
              });
            })
          );
        }
        const end = performance.now();
        console.log(`Time taken: ${end - start} milliseconds`);
      }
    } catch (error) {
      console.error("Error in game loop:", error);
    }
  };

  const handleToggleCell = async (x: number, y: number) => {
    const result = await toggleCell(x, y);
    setGrid(result);
  };

  const handleResetGrid = async () => {
    const result = await resetGrid();
    setGrid(result);
  };

  // Initialize connection and grid
  onMount(async () => {
    setGrid(await getInitialGrid());
    startGameLoop();
  });

  onCleanup(() => {
    gameIterator = null;
  });

  return (
    <main>
      <h1>Conway's Game of Life</h1>
      <div class="controls">
        <button onClick={handleResetGrid}>Reset Pattern</button>
      </div>
      <div
        class="grid"
        style={{
          display: "grid",
          "grid-template-columns": `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: "1px",
          "background-color": "#ccc",
          padding: "1px",
        }}
      >
        <For each={grid}>
          {(row, i) => (
            <For each={row}>
              {(cell, j) => (
                <div
                  class="cell"
                  style={{
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    "background-color": cell.alive
                      ? cell.color || "#000"
                      : "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => handleToggleCell(i(), j())}
                />
              )}
            </For>
          )}
        </For>
      </div>
    </main>
  );
}
