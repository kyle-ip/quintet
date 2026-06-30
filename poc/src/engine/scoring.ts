/** v4 scoring — steeper premium tiers (see docs/scoring-design.*.md) */

import { cardLabel, type Card } from "./card";
import { Grid, allLines, type BoardSize, type Cell } from "./grid";
import { evaluateLine, HandCategory, CATEGORY_NAMES, type HandResult } from "./hand";

export function scoreV4(hand: HandResult): number {
  const r = hand.ranks;
  switch (hand.category) {
    case HandCategory.RoyalFlush:
      return 200;
    case HandCategory.StraightFlush:
      return 165 + r[0] * 0.1;
    case HandCategory.FourOfAKind:
      return 130 + r[0] * 0.5 + r[1] * 0.1;
    case HandCategory.FullHouse:
      return 98 + r[0] * 0.2 + r[1] * 0.1;
    case HandCategory.Flush:
      return 78 + r.reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.Straight:
      return 62 + r[0] * 0.1;
    case HandCategory.ThreeOfAKind:
      return 24 + r[0] * 0.2 + r.slice(1).reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.TwoPair:
      return 16 + r[0] * 0.1 + r[1] * 0.1 + (r[2] ?? 0) * 0.05;
    case HandCategory.OnePair:
      return 9 + r[0] * 0.1 + r.slice(1).reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.HighCard:
      return 4 + r[0] * 0.1 + r.slice(1, 3).reduce((a, b) => a + b, 0) * 0.05;
    default:
      return 0;
  }
}

export function scoreV3(hand: HandResult): number {
  const r = hand.ranks;
  switch (hand.category) {
    case HandCategory.RoyalFlush:
      return 100;
    case HandCategory.StraightFlush:
      return 92 + r[0] * 0.1;
    case HandCategory.FourOfAKind:
      return 78 + r[0] * 0.5 + r[1] * 0.1;
    case HandCategory.FullHouse:
      return 62 + r[0] * 0.2 + r[1] * 0.1;
    case HandCategory.Flush:
      return 52 + r.reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.Straight:
      return 45 + r[0] * 0.1;
    case HandCategory.ThreeOfAKind:
      return 28 + r[0] * 0.2 + r.slice(1).reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.TwoPair:
      return 18 + r[0] * 0.1 + r[1] * 0.1 + (r[2] ?? 0) * 0.05;
    case HandCategory.OnePair:
      return 10 + r[0] * 0.1 + r.slice(1).reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.HighCard:
      return 5 + r[0] * 0.1 + r.slice(1, 3).reduce((a, b) => a + b, 0) * 0.05;
    default:
      return 0;
  }
}

/** Active scoring rule for gameplay. */
export const scoreActive = scoreV4;

/** v4 scoring for 4-card lines (4×4 board). */
export function scoreV4Four(hand: HandResult): number {
  const r = hand.ranks;
  switch (hand.category) {
    case HandCategory.StraightFlush:
      return 120 + r[0] * 0.1;
    case HandCategory.FourOfAKind:
      return 95 + r[0] * 0.5;
    case HandCategory.Flush:
      return 56 + r.reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.Straight:
      return 44 + r[0] * 0.1;
    case HandCategory.ThreeOfAKind:
      return 17 + r[0] * 0.2 + (r[1] ?? 0) * 0.05;
    case HandCategory.TwoPair:
      return 11.5 + r[0] * 0.1 + r[1] * 0.1;
    case HandCategory.OnePair:
      return 6.5 + r[0] * 0.1 + r.slice(1).reduce((a, b) => a + b, 0) * 0.05;
    case HandCategory.HighCard:
      return 3 + r[0] * 0.1 + r.slice(1, 3).reduce((a, b) => a + b, 0) * 0.05;
    default:
      return 0;
  }
}

export function scoreHand(cards: Card[], hand: HandResult): number {
  return cards.length === 4 ? scoreV4Four(hand) : scoreV4(hand);
}

/** Round to one decimal place (half-up), shared with Python `round_score`. */
export function roundScore(value: number): number {
  return Math.floor(value * 10 + 0.5 + 1e-9) / 10;
}

export interface LineScore {
  line: string;
  hand: string | null;
  points: number | null;
  placed: number;
  complete: boolean;
  cards: string[];
}

export interface ScoreSnapshot {
  total: number;
  lines: LineScore[];
}

export function scoreLine(cards: Card[]): { hand: HandResult; points: number } {
  const hand = evaluateLine(cards);
  return { hand, points: scoreHand(cards, hand) };
}

export function scoreGridComplete(grid: Grid): ScoreSnapshot {
  const lineLen = grid.size;
  const lines: LineScore[] = [];
  let total = 0;
  for (const { id, positions } of grid.lines) {
    const cards = grid.lineCards(positions);
    const { hand, points } = scoreLine(cards);
    total += points;
    lines.push({
      line: id,
      hand: handDisplayName(hand.name),
      points: roundScore(points),
      placed: lineLen,
      complete: true,
      cards: cards.map((c) => `${c.rank}${c.suit}`),
    });
  }
  return { total: roundScore(total), lines };
}

/** Live score: only complete lines count toward total. */
export function scoreGridLive(grid: Grid): ScoreSnapshot {
  const lineLen = grid.size;
  const lines: LineScore[] = [];
  let total = 0;
  for (const { id, positions } of grid.lines) {
    const partial = grid.partialLineCards(positions);
    if (partial.length === lineLen) {
      const { hand, points } = scoreLine(partial);
      total += points;
      lines.push({
        line: id,
        hand: handDisplayName(hand.name),
        points: roundScore(points),
        placed: lineLen,
        complete: true,
        cards: partial.map((c) => `${c.rank}${c.suit}`),
      });
    } else {
      lines.push({
        line: id,
        hand: null,
        points: null,
        placed: partial.length,
        complete: false,
        cards: partial.map((c) => `${c.rank}${c.suit}`),
      });
    }
  }
  return { total: roundScore(total), lines };
}

export function linesThroughCell({ row, col }: Cell, boardSize: BoardSize): string[] {
  return allLines(boardSize)
    .filter(({ positions }) => positions.some((p) => p.row === row && p.col === col))
    .map((l) => l.id);
}

const HAND_DISPLAY: Record<string, string> = {
  high_card: "High Card",
  one_pair: "One Pair",
  two_pair: "Two Pair",
  three_of_a_kind: "Three of a Kind",
  straight: "Straight",
  flush: "Flush",
  full_house: "Full House",
  four_of_a_kind: "Four of a Kind",
  straight_flush: "Straight Flush",
  royal_flush: "Royal Flush",
};

export function lineDisplayName(lineId: string): string {
  if (lineId.startsWith("row_")) {
    return `Row ${Number(lineId.slice(4)) + 1}`;
  }
  if (lineId.startsWith("col_")) {
    return `Col ${Number(lineId.slice(4)) + 1}`;
  }
  if (lineId === "diag_main") return "Main diagonal";
  if (lineId === "diag_anti") return "Anti diagonal";
  return lineId;
}

export function handDisplayName(handKey: string): string {
  return HAND_DISPLAY[handKey] ?? handKey;
}

/** Human-readable v4 formula with substituted rank values. */
export function explainScoreV4(hand: HandResult): string {
  const r = hand.ranks;
  const total = roundScore(scoreV4(hand));
  const eq = (expr: string) => `${expr} = ${total.toFixed(1)}`;

  switch (hand.category) {
    case HandCategory.RoyalFlush:
      return eq("200");
    case HandCategory.StraightFlush:
      return eq(`165 + ${r[0]}×0.1`);
    case HandCategory.FourOfAKind:
      return eq(`130 + ${r[0]}×0.5 + ${r[1]}×0.1`);
    case HandCategory.FullHouse:
      return eq(`98 + ${r[0]}×0.2 + ${r[1]}×0.1`);
    case HandCategory.Flush: {
      const sum = r.reduce((a, b) => a + b, 0);
      return eq(`78 + ${sum}×0.05`);
    }
    case HandCategory.Straight:
      return eq(`62 + ${r[0]}×0.1`);
    case HandCategory.ThreeOfAKind: {
      const kickers = r.slice(1).reduce((a, b) => a + b, 0);
      return eq(`24 + ${r[0]}×0.2 + ${kickers}×0.05`);
    }
    case HandCategory.TwoPair:
      return eq(`16 + ${r[0]}×0.1 + ${r[1]}×0.1 + ${r[2] ?? 0}×0.05`);
    case HandCategory.OnePair: {
      const kickers = r.slice(1).reduce((a, b) => a + b, 0);
      return eq(`9 + ${r[0]}×0.1 + ${kickers}×0.05`);
    }
    case HandCategory.HighCard: {
      const rest = r.slice(1, 3).reduce((a, b) => a + b, 0);
      return eq(`4 + ${r[0]}×0.1 + ${rest}×0.05`);
    }
    default:
      return total.toFixed(1);
  }
}

/** Human-readable v3 formula (historical). */
export function explainScoreV3(hand: HandResult): string {
  const r = hand.ranks;
  const total = roundScore(scoreV3(hand));
  const eq = (expr: string) => `${expr} = ${total.toFixed(1)}`;

  switch (hand.category) {
    case HandCategory.RoyalFlush:
      return eq("100");
    case HandCategory.StraightFlush:
      return eq(`92 + ${r[0]}×0.1`);
    case HandCategory.FourOfAKind:
      return eq(`78 + ${r[0]}×0.5 + ${r[1]}×0.1`);
    case HandCategory.FullHouse:
      return eq(`62 + ${r[0]}×0.2 + ${r[1]}×0.1`);
    case HandCategory.Flush: {
      const sum = r.reduce((a, b) => a + b, 0);
      return eq(`52 + ${sum}×0.05`);
    }
    case HandCategory.Straight:
      return eq(`45 + ${r[0]}×0.1`);
    case HandCategory.ThreeOfAKind: {
      const kickers = r.slice(1).reduce((a, b) => a + b, 0);
      return eq(`28 + ${r[0]}×0.2 + ${kickers}×0.05`);
    }
    case HandCategory.TwoPair:
      return eq(`18 + ${r[0]}×0.1 + ${r[1]}×0.1 + ${r[2] ?? 0}×0.05`);
    case HandCategory.OnePair: {
      const kickers = r.slice(1).reduce((a, b) => a + b, 0);
      return eq(`10 + ${r[0]}×0.1 + ${kickers}×0.05`);
    }
    case HandCategory.HighCard: {
      const rest = r.slice(1, 3).reduce((a, b) => a + b, 0);
      return eq(`5 + ${r[0]}×0.1 + ${rest}×0.05`);
    }
    default:
      return total.toFixed(1);
  }
}

export const explainScoreActive = (hand: HandResult, lineLength = 5): string =>
  lineLength === 4 ? explainScoreV4Four(hand) : explainScoreV4(hand);

/** Human-readable v4 formula for 4-card lines. */
export function explainScoreV4Four(hand: HandResult): string {
  const r = hand.ranks;
  const total = roundScore(scoreV4Four(hand));
  const eq = (expr: string) => `${expr} = ${total.toFixed(1)}`;

  switch (hand.category) {
    case HandCategory.StraightFlush:
      return eq(`120 + ${r[0]}×0.1`);
    case HandCategory.FourOfAKind:
      return eq(`95 + ${r[0]}×0.5`);
    case HandCategory.Flush: {
      const sum = r.reduce((a, b) => a + b, 0);
      return eq(`56 + ${sum}×0.05`);
    }
    case HandCategory.Straight:
      return eq(`44 + ${r[0]}×0.1`);
    case HandCategory.ThreeOfAKind:
      return eq(`17 + ${r[0]}×0.2 + ${r[1] ?? 0}×0.05`);
    case HandCategory.TwoPair:
      return eq(`11.5 + ${r[0]}×0.1 + ${r[1]}×0.1`);
    case HandCategory.OnePair: {
      const kickers = r.slice(1).reduce((a, b) => a + b, 0);
      return eq(`6.5 + ${r[0]}×0.1 + ${kickers}×0.05`);
    }
    case HandCategory.HighCard: {
      const rest = r.slice(1, 3).reduce((a, b) => a + b, 0);
      return eq(`3 + ${r[0]}×0.1 + ${rest}×0.05`);
    }
    default:
      return total.toFixed(1);
  }
}
export interface LineHint {
  lineId: string;
  label: string;
  placed: number;
  complete: boolean;
  hand: string | null;
  points: number | null;
  formula: string | null;
  cards: string[];
}

export interface CellScoreHint {
  lines: LineHint[];
  /** Sum of confirmed points from complete lines through this cell. */
  total: number;
  completeCount: number;
}

function rankCounts(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const c of cards) {
    counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
  }
  return counts;
}

function ranksWithCount(counts: Map<number, number>, n: number): number[] {
  return [...counts.entries()]
    .filter(([, c]) => c === n)
    .map(([r]) => r)
    .sort((a, b) => b - a);
}

/**
 * Best hand category already formed by placed cards on a line (< 5 cards).
 * Flush, straight, etc. require all 5 cards — not inferred from partials.
 */
export function detectExistingPartialHand(cards: Card[], lineLength = 5): HandResult {
  const counts = rankCounts(cards);
  const pattern = [...counts.values()].sort((a, b) => b - a);
  const sortedRanks = cards.map((c) => c.rank).sort((a, b) => b - a);

  const make = (category: HandCategory, ranks: number[]): HandResult => ({
    category,
    ranks,
    name: CATEGORY_NAMES[category],
  });

  if (lineLength === 5 && pattern[0] === 3 && pattern[1] === 2) {
    return make(HandCategory.FullHouse, [
      ranksWithCount(counts, 3)[0],
      ranksWithCount(counts, 2)[0],
    ]);
  }

  if (pattern[0] === 4) {
    return make(HandCategory.FourOfAKind, [
      ranksWithCount(counts, 4)[0],
      ranksWithCount(counts, 1)[0] ?? 0,
    ]);
  }

  if (pattern[0] === 3) {
    const trip = ranksWithCount(counts, 3)[0];
    const kickers = sortedRanks.filter((r) => r !== trip);
    return make(HandCategory.ThreeOfAKind, [trip, ...kickers]);
  }

  if (pattern[0] === 2 && pattern[1] === 2) {
    const pairs = ranksWithCount(counts, 2);
    return make(HandCategory.TwoPair, [
      pairs[0],
      pairs[1],
      ...(lineLength === 5 ? [ranksWithCount(counts, 1)[0] ?? 0] : []),
    ]);
  }

  if (pattern[0] === 2) {
    const pair = ranksWithCount(counts, 2)[0];
    const kickers = sortedRanks.filter((r) => r !== pair);
    return make(HandCategory.OnePair, [pair, ...kickers]);
  }

  return make(HandCategory.HighCard, sortedRanks.slice(0, lineLength === 4 ? 2 : 3));
}

/** Score from the highest hand already present on the line (no future completions). */
export function scorePartialLine(
  cards: Card[],
  lineLength = 5,
): { hand: HandResult; points: number } | null {
  if (cards.length === 0) return null;
  if (cards.length === lineLength) {
    const hand = evaluateLine(cards);
    return { hand, points: scoreHand(cards, hand) };
  }
  const hand = detectExistingPartialHand(cards, lineLength);
  const points = lineLength === 4 ? scoreV4Four(hand) : scoreV4(hand);
  return { hand, points };
}

function buildLineHint(lineId: string, partial: Card[], lineLength: number): LineHint {
  const label = lineDisplayName(lineId);
  const cards = partial.map(cardLabel);
  const scored = scorePartialLine(partial, lineLength);

  if (!scored) {
    return {
      lineId,
      label,
      placed: 0,
      complete: false,
      hand: null,
      points: null,
      formula: null,
      cards,
    };
  }

  const rounded = roundScore(scored.points);
  return {
    lineId,
    label,
    placed: partial.length,
    complete: partial.length === lineLength,
    hand: handDisplayName(scored.hand.name),
    points: rounded,
    formula: explainScoreActive(scored.hand, partial.length),
    cards,
  };
}

export function getCellScoreHint(grid: Grid, row: number, col: number): CellScoreHint {
  const lineIds = linesThroughCell({ row, col }, grid.size);
  const lines: LineHint[] = [];
  let total = 0;
  let completeCount = 0;

  for (const lineId of lineIds) {
    const lineDef = grid.lines.find((l) => l.id === lineId);
    if (!lineDef) continue;

    const partial = grid.partialLineCards(lineDef.positions);
    const hint = buildLineHint(lineId, partial, grid.size);
    lines.push(hint);
    if (hint.complete && hint.points !== null) {
      total += hint.points;
      completeCount += 1;
    }
  }

  return {
    lines,
    total: roundScore(total),
    completeCount,
  };
}
