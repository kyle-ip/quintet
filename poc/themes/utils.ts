import type { Card } from "@/engine/card";
import { RANK_LABELS, SUIT_SYMBOLS, type Suit } from "@/engine/card";

const RED_SUITS: Suit[] = ["h", "d"];

export function isRedSuit(suit: Suit): boolean {
  return RED_SUITS.includes(suit);
}

export function rankLabel(card: Card): string {
  return RANK_LABELS[card.rank];
}

export function suitSymbol(card: Card): string {
  return SUIT_SYMBOLS[card.suit];
}
