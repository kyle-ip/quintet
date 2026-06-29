import type { ComponentType } from "react";
import * as PlayingCards from "@letele/playing-cards";
import type { CardFaceProps } from "./types";
import { toDeckKey } from "./deckKey";

type DeckComponent = ComponentType<{
  width?: number;
  height?: number;
  preserveAspectRatio?: string;
  className?: string;
}>;

const deck = PlayingCards as Record<string, DeckComponent>;

/** Adrian Kennard SVG deck via @letele/playing-cards (CC0). */
export function LeteleClassic({ card, className }: CardFaceProps) {
  const key = toDeckKey(card);
  const DeckCard = deck[key];
  if (!DeckCard) {
    return <div className={`theme-letele-fallback ${className ?? ""}`}>?</div>;
  }
  return (
    <DeckCard
      width={240}
      height={336}
      preserveAspectRatio="xMidYMid meet"
      className={`theme-letele-svg ${className ?? ""}`}
    />
  );
}
