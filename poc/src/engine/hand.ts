import type { Card } from "./card";

export enum HandCategory {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

export const CATEGORY_NAMES: Record<HandCategory, string> = {
  [HandCategory.HighCard]: "high_card",
  [HandCategory.OnePair]: "one_pair",
  [HandCategory.TwoPair]: "two_pair",
  [HandCategory.ThreeOfAKind]: "three_of_a_kind",
  [HandCategory.Straight]: "straight",
  [HandCategory.Flush]: "flush",
  [HandCategory.FullHouse]: "full_house",
  [HandCategory.FourOfAKind]: "four_of_a_kind",
  [HandCategory.StraightFlush]: "straight_flush",
  [HandCategory.RoyalFlush]: "royal_flush",
};

export interface HandResult {
  category: HandCategory;
  ranks: number[];
  name: string;
}

function straightHigh(ranks: number[]): number | null {
  const unique = [...new Set(ranks)].sort((a, b) => b - a);
  if (unique.length !== 5) return null;
  if (unique[0] - unique[4] === 4) return unique[0];
  if (unique.join(",") === "14,5,4,3,2") return 5;
  return null;
}

function countRanks(ranks: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const r of ranks) {
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  return counts;
}

export function evaluateFive(cards: Card[]): HandResult {
  if (cards.length !== 5) {
    throw new Error("Exactly five cards required");
  }

  const ranks = cards.map((c) => c.rank);
  const suits = cards.map((c) => c.suit);
  const counts = countRanks(ranks);
  const isFlush = new Set(suits).size === 1;
  const high = straightHigh(ranks);
  const pattern = [...counts.values()].sort((a, b) => b - a);

  const byCount = (n: number) =>
    [...counts.entries()].filter(([, c]) => c === n).map(([r]) => r);

  if (isFlush && high === 14) {
    return { category: HandCategory.RoyalFlush, ranks: [14], name: CATEGORY_NAMES[HandCategory.RoyalFlush] };
  }
  if (isFlush && high !== null) {
    return {
      category: HandCategory.StraightFlush,
      ranks: [high],
      name: CATEGORY_NAMES[HandCategory.StraightFlush],
    };
  }
  if (pattern.join(",") === "4,1") {
    const quad = Math.max(...byCount(4));
    const kicker = Math.max(...byCount(1));
    return { category: HandCategory.FourOfAKind, ranks: [quad, kicker], name: CATEGORY_NAMES[HandCategory.FourOfAKind] };
  }
  if (pattern.join(",") === "3,2") {
    const trips = Math.max(...byCount(3));
    const pair = Math.max(...byCount(2));
    return { category: HandCategory.FullHouse, ranks: [trips, pair], name: CATEGORY_NAMES[HandCategory.FullHouse] };
  }
  if (isFlush) {
    return {
      category: HandCategory.Flush,
      ranks: [...ranks].sort((a, b) => b - a),
      name: CATEGORY_NAMES[HandCategory.Flush],
    };
  }
  if (high !== null) {
    return { category: HandCategory.Straight, ranks: [high], name: CATEGORY_NAMES[HandCategory.Straight] };
  }
  if (pattern.join(",") === "3,1,1") {
    const trips = Math.max(...byCount(3));
    const kickers = byCount(1).sort((a, b) => b - a);
    return {
      category: HandCategory.ThreeOfAKind,
      ranks: [trips, ...kickers],
      name: CATEGORY_NAMES[HandCategory.ThreeOfAKind],
    };
  }
  if (pattern.join(",") === "2,2,1") {
    const pairs = byCount(2).sort((a, b) => b - a);
    const kicker = Math.max(...byCount(1));
    return {
      category: HandCategory.TwoPair,
      ranks: [pairs[0], pairs[1], kicker],
      name: CATEGORY_NAMES[HandCategory.TwoPair],
    };
  }
  if (pattern.join(",") === "2,1,1,1") {
    const pair = Math.max(...byCount(2));
    const kickers = byCount(1).sort((a, b) => b - a);
    return {
      category: HandCategory.OnePair,
      ranks: [pair, ...kickers],
      name: CATEGORY_NAMES[HandCategory.OnePair],
    };
  }

  return {
    category: HandCategory.HighCard,
    ranks: [...ranks].sort((a, b) => b - a),
    name: CATEGORY_NAMES[HandCategory.HighCard],
  };
}

function straightHighFour(ranks: number[]): number | null {
  const unique = [...new Set(ranks)].sort((a, b) => b - a);
  if (unique.length !== 4) return null;
  if (unique[0] - unique[3] === 3) return unique[0];
  if (unique.join(",") === "14,4,3,2") return 4;
  return null;
}

/** Evaluate a complete scoring line of four cards (4×4 board). */
export function evaluateFour(cards: Card[]): HandResult {
  if (cards.length !== 4) {
    throw new Error("Exactly four cards required");
  }

  const ranks = cards.map((c) => c.rank);
  const suits = cards.map((c) => c.suit);
  const counts = countRanks(ranks);
  const isFlush = new Set(suits).size === 1;
  const high = straightHighFour(ranks);
  const pattern = [...counts.values()].sort((a, b) => b - a);

  const byCount = (n: number) =>
    [...counts.entries()].filter(([, c]) => c === n).map(([r]) => r);

  if (pattern[0] === 4) {
    const quad = Math.max(...byCount(4));
    return { category: HandCategory.FourOfAKind, ranks: [quad], name: CATEGORY_NAMES[HandCategory.FourOfAKind] };
  }
  if (isFlush && high !== null) {
    return {
      category: HandCategory.StraightFlush,
      ranks: [high],
      name: CATEGORY_NAMES[HandCategory.StraightFlush],
    };
  }
  if (isFlush) {
    return {
      category: HandCategory.Flush,
      ranks: [...ranks].sort((a, b) => b - a),
      name: CATEGORY_NAMES[HandCategory.Flush],
    };
  }
  if (high !== null) {
    return { category: HandCategory.Straight, ranks: [high], name: CATEGORY_NAMES[HandCategory.Straight] };
  }
  if (pattern.join(",") === "3,1") {
    const trips = Math.max(...byCount(3));
    const kicker = Math.max(...byCount(1));
    return {
      category: HandCategory.ThreeOfAKind,
      ranks: [trips, kicker],
      name: CATEGORY_NAMES[HandCategory.ThreeOfAKind],
    };
  }
  if (pattern.join(",") === "2,2") {
    const pairs = byCount(2).sort((a, b) => b - a);
    return {
      category: HandCategory.TwoPair,
      ranks: [pairs[0], pairs[1]],
      name: CATEGORY_NAMES[HandCategory.TwoPair],
    };
  }
  if (pattern.join(",") === "2,1,1") {
    const pair = Math.max(...byCount(2));
    const kickers = byCount(1).sort((a, b) => b - a);
    return {
      category: HandCategory.OnePair,
      ranks: [pair, ...kickers],
      name: CATEGORY_NAMES[HandCategory.OnePair],
    };
  }

  return {
    category: HandCategory.HighCard,
    ranks: [...ranks].sort((a, b) => b - a),
    name: CATEGORY_NAMES[HandCategory.HighCard],
  };
}

export function evaluateLine(cards: Card[]): HandResult {
  if (cards.length === 5) return evaluateFive(cards);
  if (cards.length === 4) return evaluateFour(cards);
  throw new Error(`Cannot evaluate line of ${cards.length} cards`);
}
