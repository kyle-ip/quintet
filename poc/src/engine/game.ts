import type { Card } from "./card";
import { Deck } from "./deck";
import { boardCellCount, type BoardSize, DEFAULT_BOARD_SIZE, Grid } from "./grid";
import { scoreGridComplete } from "./scoring";

export type GameStatus = "playing" | "finished";

export const POOL_SIZE_MIN = 1;
export const POOL_SIZE_MAX = 5;
export const DEFAULT_POOL_SIZE = 5;
export const POOL_SIZE_OPTIONS = [1, 2, 3, 4, 5] as const;

export interface SoloGameState {
  poolSize: number;
  boardSize: BoardSize;
  deck: Card[];
  pool: Card[];
  gridCells: (Card | null)[];
  turn: number;
  status: GameStatus;
  /** Cards available at shuffle time (sub-deck pressure). */
  deckSize: number;
}

export interface CreateGameOptions {
  boardSize?: BoardSize;
  deckSize?: number;
  rng?: () => number;
}

export function gridFromState(state: SoloGameState): Grid {
  return Grid.fromCells(state.gridCells, state.boardSize);
}

export function createInitialState(
  poolSize: number,
  options: CreateGameOptions | (() => number) = {},
): SoloGameState {
  let opts: CreateGameOptions;
  if (typeof options === "function") {
    opts = { rng: options };
  } else {
    opts = options;
  }
  const rng = opts.rng ?? Math.random;
  const boardSize = opts.boardSize ?? DEFAULT_BOARD_SIZE;
  const cells = boardCellCount(boardSize);
  if (poolSize < POOL_SIZE_MIN || poolSize > POOL_SIZE_MAX) {
    throw new Error(`pool_size must be ${POOL_SIZE_MIN}–${POOL_SIZE_MAX}`);
  }
  const deckSize = opts.deckSize ?? 52;
  if (deckSize < cells || deckSize > 52) {
    throw new Error(`deckSize must be ${cells}–52`);
  }
  const deck = new Deck();
  deck.shuffle(rng);
  const state: SoloGameState = {
    poolSize,
    boardSize,
    deck: deck.cards.slice(0, deckSize),
    pool: [],
    gridCells: Array(cells).fill(null),
    turn: 0,
    status: "playing",
    deckSize,
  };
  return refillPool(state);
}

function refillPool(state: SoloGameState): SoloGameState {
  const needed = state.poolSize - state.pool.length;
  if (needed <= 0 || state.deck.length === 0) {
    return state;
  }
  const drawCount = Math.min(needed, state.deck.length);
  return {
    ...state,
    deck: state.deck.slice(drawCount),
    pool: [...state.pool, ...state.deck.slice(0, drawCount)],
  };
}

export function legalCellKeys(state: SoloGameState): string[] {
  const grid = gridFromState(state);
  return grid.legalPositions().map(({ row, col }) => `${row},${col}`);
}

export function canDropOnCell(state: SoloGameState, row: number, col: number): boolean {
  return legalCellKeys(state).includes(`${row},${col}`);
}

export function placeFromPool(
  state: SoloGameState,
  poolIndex: number,
  row: number,
  col: number,
): SoloGameState {
  if (state.status !== "playing") {
    throw new Error("Game is finished");
  }
  const grid = gridFromState(state);
  if (grid.isFull()) {
    throw new Error("Grid is full");
  }
  if (poolIndex < 0 || poolIndex >= state.pool.length) {
    throw new Error("Invalid pool index");
  }
  if (!canDropOnCell(state, row, col)) {
    throw new Error("Illegal placement");
  }

  const pool = [...state.pool];
  const [card] = pool.splice(poolIndex, 1);
  grid.place(row, col, card);

  let next: SoloGameState = {
    ...state,
    pool,
    gridCells: grid.cloneCells(),
    turn: state.turn + 1,
  };
  if (pool.length === 0 && !grid.isFull()) {
    next = refillPool(next);
  }
  if (grid.isFull()) {
    next.status = "finished";
  }
  return next;
}

export function finalScore(state: SoloGameState) {
  const grid = gridFromState(state);
  if (!grid.isFull()) {
    throw new Error("Game not finished");
  }
  return scoreGridComplete(grid);
}
