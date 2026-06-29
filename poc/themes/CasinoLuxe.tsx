import type { CardFaceProps } from "./types";
import { isRedSuit, rankLabel, suitSymbol } from "./utils";
import "./styles/casino-luxe.css";

/** Cream face, gold trim — casino table aesthetic. */
export function CasinoLuxe({ card, className }: CardFaceProps) {
  const red = isRedSuit(card.suit);
  return (
    <div className={`theme-casino-luxe ${red ? "is-red" : "is-black"} ${className ?? ""}`}>
      <div className="theme-casino-luxe__inner">
        <span className="theme-casino-luxe__rank">{rankLabel(card)}</span>
        <span className="theme-casino-luxe__suit">{suitSymbol(card)}</span>
      </div>
    </div>
  );
}
