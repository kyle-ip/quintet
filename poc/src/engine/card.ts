export type Suit = "c" | "d" | "h" | "s";

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANK_LABELS: Record<Rank, string> = {
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  c: "♣",
  d: "♦",
  h: "♥",
  s: "♠",
};

export function cardId(card: Card): string {
  const rank =
    card.rank === 10 ? "10" : card.rank === 11 ? "J" : card.rank === 12 ? "Q" : card.rank === 13 ? "K" : card.rank === 14 ? "A" : String(card.rank);
  return `${rank}${card.suit}`;
}

export function cardLabel(card: Card): string {
  return `${RANK_LABELS[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}

export function parseCard(text: string): Card {
  const normalized = text.trim().toUpperCase();
  const rankMap: Record<string, Rank> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  const suitMap: Record<string, Suit> = {
    C: "c",
    D: "d",
    H: "h",
    S: "s",
  };
  const rankPart = normalized.length === 3 && normalized.startsWith("10") ? "10" : normalized[0];
  const suitPart = normalized.length === 3 ? normalized[2] : normalized[1];
  const rank = rankMap[rankPart];
  const suit = suitMap[suitPart];
  if (rank === undefined || suit === undefined) {
    throw new Error(`Invalid card: ${text}`);
  }
  return { rank, suit };
}

export function standardDeck(): Card[] {
  const suits: Suit[] = ["c", "d", "h", "s"];
  const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}
