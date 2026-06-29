import type { CardFaceProps } from "./types";
import { isRedSuit, rankLabel, suitSymbol } from "./utils";
import "./styles/typographic.css";

/** Oversized rank typography; suit as accent only. */
export function Typographic({ card, className }: CardFaceProps) {
  const red = isRedSuit(card.suit);
  return (
    <div className={`theme-typographic ${red ? "is-red" : "is-black"} ${className ?? ""}`}>
      <span className="theme-typographic__rank">{rankLabel(card)}</span>
      <span className="theme-typographic__suit">{suitSymbol(card)}</span>
    </div>
  );
}
