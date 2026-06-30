import type { Card } from "./card";
import type { Grid } from "./grid";
import { parseCellKey } from "./grid";
import type { SoloGameState } from "./game";
import { gridFromState, legalCellKeys } from "./game";
import { scorePartialLine } from "./scoring";

export interface GreedyAction {
  poolIndex: number;
  row: number;
  col: number;
}

function partialLineValue(cards: Card[], lineLength: number): number {
  if (cards.length === 0) return 0;
  if (cards.length === lineLength) {
    const scored = scorePartialLine(cards, lineLength);
    return scored?.points ?? 0;
  }

  let value = cards.reduce((sum, c) => sum + c.rank, 0) * 0.08;

  const rankCounts = new Map<number, number>();
  const suitCounts = new Map<string, number>();
  for (const c of cards) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) ?? 0) + 1);
    suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }

  for (const count of rankCounts.values()) {
    if (count >= 2) value += count * 4.5;
    if (count >= 3) value += 8;
  }

  for (const count of suitCounts.values()) {
    if (count >= 3) value += count * 3;
    if (count >= 4) value += 6;
  }

  return value;
}

function placementValue(grid: Grid, card: Card, row: number, col: number): number {
  const lineLength = grid.size;
  let total = 0;
  for (const { positions } of grid.lines) {
    if (!positions.some((p) => p.row === row && p.col === col)) continue;
    const existing = grid.partialLineCards(positions);
    total += partialLineValue([...existing, card], lineLength);
  }
  return total;
}

export function enumerateLegalActions(state: SoloGameState): GreedyAction[] {
  const actions: GreedyAction[] = [];
  const legal = legalCellKeys(state);
  for (let poolIndex = 0; poolIndex < state.pool.length; poolIndex++) {
    for (const key of legal) {
      const { row, col } = parseCellKey(key);
      actions.push({ poolIndex, row, col });
    }
  }
  return actions;
}

/** Pick the highest-value legal action; tie-break randomly. */
export function chooseGreedyAction(
  state: SoloGameState,
  rng: () => number = Math.random,
): GreedyAction {
  const grid = gridFromState(state);
  const actions = enumerateLegalActions(state);
  if (actions.length === 0) {
    throw new Error("No legal actions");
  }

  let bestScore = -Infinity;
  let best: GreedyAction[] = [];

  for (const action of actions) {
    const card = state.pool[action.poolIndex];
    if (!card) continue;
    const val = placementValue(grid, card, action.row, action.col);
    if (val > bestScore) {
      bestScore = val;
      best = [action];
    } else if (val === bestScore) {
      best.push(action);
    }
  }

  if (best.length === 0) {
    throw new Error("No legal actions");
  }
  return best[Math.floor(rng() * best.length)]!;
}
