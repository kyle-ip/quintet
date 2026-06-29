import type { Card } from "./card";

export const GRID_SIZE = 5;

export interface Cell {
  row: number;
  col: number;
}

export interface ScoringLine {
  id: string;
  positions: Cell[];
}

export function allLines(): ScoringLine[] {
  const lines: ScoringLine[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    lines.push({
      id: `row_${r}`,
      positions: Array.from({ length: GRID_SIZE }, (_, c) => ({ row: r, col: c })),
    });
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    lines.push({
      id: `col_${c}`,
      positions: Array.from({ length: GRID_SIZE }, (_, r) => ({ row: r, col: c })),
    });
  }
  lines.push({
    id: "diag_main",
    positions: Array.from({ length: GRID_SIZE }, (_, i) => ({ row: i, col: i })),
  });
  lines.push({
    id: "diag_anti",
    positions: Array.from({ length: GRID_SIZE }, (_, i) => ({ row: i, col: GRID_SIZE - 1 - i })),
  });
  return lines;
}

export const LINES = allLines();

export class Grid {
  cells: (Card | null)[];

  constructor() {
    this.cells = Array(GRID_SIZE * GRID_SIZE).fill(null);
  }

  private idx(row: number, col: number): number {
    return row * GRID_SIZE + col;
  }

  get(row: number, col: number): Card | null {
    return this.cells[this.idx(row, col)];
  }

  place(row: number, col: number, card: Card): void {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
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
      return nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && this.get(nr, nc) !== null;
    });
  }

  count(): number {
    return this.cells.filter((c) => c !== null).length;
  }

  isFull(): boolean {
    return this.count() === GRID_SIZE * GRID_SIZE;
  }

  legalPositions(): Cell[] {
    if (this.count() === 0) {
      const all: Cell[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          all.push({ row: r, col: c });
        }
      }
      return all;
    }
    const legal: Cell[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
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

  static fromCells(cells: (Card | null)[]): Grid {
    const grid = new Grid();
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
