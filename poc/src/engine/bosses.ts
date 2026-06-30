import { Grid, allLines } from "./grid";
import { HandCategory } from "./hand";
import { scoreLine, type ScoreSnapshot } from "./scoring";

export const BOSS_IDS = [
  "line_hunter",
  "diagonal_duel",
  "threshold_rush",
  "sparse_deck",
] as const;

export type BossId = (typeof BOSS_IDS)[number];

export interface BossDefinition {
  id: BossId;
  name: string;
  description: string;
}

export const BOSS_DEFINITIONS: Record<BossId, BossDefinition> = {
  line_hunter: {
    id: "line_hunter",
    name: "Line Hunter",
    description: "At least one complete line ranks Two Pair or better",
  },
  diagonal_duel: {
    id: "diagonal_duel",
    name: "Diagonal Duel",
    description: "Both diagonals complete",
  },
  threshold_rush: {
    id: "threshold_rush",
    name: "Threshold Rush",
    description: "Total score ≥ floor target + 20",
  },
  sparse_deck: {
    id: "sparse_deck",
    name: "Sparse Deck",
    description: "Clear on a 40-card deck with score ≥ floor target",
  },
};

export interface BossCheckContext {
  score: ScoreSnapshot;
  grid: Grid;
  gate: number;
  deckSize: number;
}

function linePositions(lineId: string, boardSize: 4 | 5): { row: number; col: number }[] {
  const line = allLines(boardSize).find((l) => l.id === lineId);
  if (!line) {
    throw new Error(`Unknown line: ${lineId}`);
  }
  return line.positions;
}

export function checkBoss(bossId: BossId, ctx: BossCheckContext): boolean {
  const boardSize = ctx.grid.size;
  switch (bossId) {
    case "line_hunter":
      return ctx.score.lines.some((line) => {
        if (!line.complete) return false;
        const { hand } = scoreLine(ctx.grid.lineCards(linePositions(line.line, boardSize)));
        return hand.category >= HandCategory.TwoPair;
      });
    case "diagonal_duel":
      return ctx.score.lines
        .filter((l) => l.line === "diag_main" || l.line === "diag_anti")
        .every((l) => l.complete);
    case "threshold_rush":
      return ctx.score.total >= ctx.gate + 20;
    case "sparse_deck":
      return ctx.deckSize <= (ctx.grid.size === 4 ? 28 : 40) && ctx.score.total >= ctx.gate;
    default:
      return false;
  }
}
