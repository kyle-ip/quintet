import type { Card } from "@/engine/card";

const SUIT_EXPORT: Record<Card["suit"], string> = {
  c: "C",
  d: "D",
  h: "H",
  s: "S",
};

/** Map internal card to @letele/playing-cards export key (e.g. Ha, D10, Sk). */
export function toDeckKey(card: Card): string {
  const suit = SUIT_EXPORT[card.suit];
  const rank =
    card.rank === 14
      ? "a"
      : card.rank === 13
        ? "k"
        : card.rank === 12
          ? "q"
          : card.rank === 11
            ? "j"
            : card.rank === 10
              ? "10"
              : String(card.rank);
  return `${suit}${rank}`;
}
