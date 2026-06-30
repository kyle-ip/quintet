import type { Card } from "./card";

export type BoardSize = 4 | 5;

export const DEFAULT_BOARD_SIZE: BoardSize = 5;
/** @deprecated Use boardSize on game state; default 5×5 */
export const GRID_SIZE = DEFAULT_BOARD_SIZE;

export const BOARD_SIZE_OPTIONS: BoardSize[] = [5, 4];

export function boardCellCount(size: BoardSize): number {
  return size * size;
}

export function boardLineCount(size: BoardSize): number {
  return size * 2 + 2;
}

export interface Cell {
  row: number;
  col: number;
}

export interface ScoringLine {
  id: string;
  positions: Cell[];
}

export function allLines(size: BoardSize): ScoringLine[] {
  const lines: ScoringLine[] = [];
  for (let r = 0; r < size; r++) {
    lines.push({
      id: `row_${r}`,
      positions: Array.from({ length: size }, (_, c) => ({ row: r, col: c })),
    });
  }
  for (let c = 0; c < size; c++) {
    lines.push({
      id: `col_${c}`,
      positions: Array.from({ length: size }, (_, r) => ({ row: r, col: c })),
    });
  }
  lines.push({
    id: "diag_main",
    positions: Array.from({ length: size }, (_, i) => ({ row: i, col: i })),
  });
  lines.push({
    id: "diag_anti",
    positions: Array.from({ length: size }, (_, i) => ({ row: i, col: size - 1 - i })),
  });
  return lines;
}

/** Default 5×5 lines — used by golden tests */
export const LINES = allLines(5);

export class Grid {
  readonly size: BoardSize;
  cells: (Card | null)[];

  constructor(size: BoardSize = DEFAULT_BOARD_SIZE) {
    this.size = size;
    this.cells = Array(boardCellCount(size)).fill(null);
  }

  get lines(): ScoringLine[] {
    return allLines(this.size);
  }

  private idx(row: number, col: number): number {
    return row * this.size + col;
  }

  get(row: number, col: number): Card | null {
    return this.cells[this.idx(row, col)];
  }

  place(row: number, col: number, card: Card): void {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      throw new Error("Out of bounds");
    }
    if (this.cells[this.idx(row, col)] !== null) {
      throw new Error("Cell occupied");
    }
    if (this.count() > 0 && !this.hasAdjacent(row, col)) {
      throw new Error("Must be adjacent to an existing card");
    }
    this.cells[this.idx(row, col)] = card;
  }

  hasAdjacent(row: number, col: number): boolean {
    const deltas: Cell[] = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
    return deltas.some(({ row: dr, col: dc }) => {
      const nr = row + dr;
      const nc = col + dc;
      return nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.get(nr, nc) !== null;
    });
  }

  count(): number {
    return this.cells.filter((c) => c !== null).length;
  }

  isFull(): boolean {
    return this.count() === boardCellCount(this.size);
  }

  legalPositions(): Cell[] {
    if (this.count() === 0) {
      const all: Cell[] = [];
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          all.push({ row: r, col: c });
        }
      }
      return all;
    }
    const legal: Cell[] = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.get(r, c) === null && this.hasAdjacent(r, c)) {
          legal.push({ row: r, col: c });
        }
      }
    }
    return legal;
  }

  lineCards(positions: Cell[]): Card[] {
    const cards = positions.map(({ row, col }) => this.get(row, col));
    if (cards.some((c) => c === null)) {
      throw new Error("Line incomplete");
    }
    return cards as Card[];
  }

  partialLineCards(positions: Cell[]): Card[] {
    return positions.flatMap(({ row, col }) => {
      const card = this.get(row, col);
      return card ? [card] : [];
    });
  }

  cloneCells(): (Card | null)[] {
    return [...this.cells];
  }

  static inferSize(cells: (Card | null)[]): BoardSize {
    const n = cells.length;
    if (n === 16) return 4;
    if (n === 25) return 5;
    const root = Math.sqrt(n);
    if (Number.isInteger(root) && (root === 4 || root === 5)) {
      return root as BoardSize;
    }
    throw new Error(`Unsupported grid cell count: ${n}`);
  }

  static fromCells(cells: (Card | null)[], size?: BoardSize): Grid {
    const boardSize = size ?? Grid.inferSize(cells);
    if (cells.length !== boardCellCount(boardSize)) {
      throw new Error(`Expected ${boardCellCount(boardSize)} cells, got ${cells.length}`);
    }
    const grid = new Grid(boardSize);
    grid.cells = [...cells];
    return grid;
  }
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parseCellKey(key: string): Cell {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}
