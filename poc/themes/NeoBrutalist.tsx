import type { CardFaceProps } from "./types";
import { isRedSuit, rankLabel, suitSymbol } from "./utils";
import "./styles/neo-brutalist.css";

/** Bold outline, hard shadow — high-contrast playful style. */
export function NeoBrutalist({ card, className }: CardFaceProps) {
  const red = isRedSuit(card.suit);
  return (
    <div className={`theme-neo-brutalist ${red ? "is-red" : "is-black"} ${className ?? ""}`}>
      <span className="theme-neo-brutalist__rank">{rankLabel(card)}</span>
      <span className="theme-neo-brutalist__suit">{suitSymbol(card)}</span>
    </div>
  );
}
