import type { CardFaceProps } from "./types";
import { isRedSuit, rankLabel, suitSymbol } from "./utils";
import "./styles/minimal-flat.css";

/** Clean flat vector-style face; pure CSS, no external assets. */
export function MinimalFlat({ card, className }: CardFaceProps) {
  const red = isRedSuit(card.suit);
  return (
    <div className={`theme-minimal-flat ${red ? "is-red" : "is-black"} ${className ?? ""}`}>
      <span className="theme-minimal-flat__corner theme-minimal-flat__corner--tl">
        <span className="theme-minimal-flat__rank">{rankLabel(card)}</span>
        <span className="theme-minimal-flat__suit">{suitSymbol(card)}</span>
      </span>
      <span className="theme-minimal-flat__center">{suitSymbol(card)}</span>
      <span className="theme-minimal-flat__corner theme-minimal-flat__corner--br">
        <span className="theme-minimal-flat__rank">{rankLabel(card)}</span>
        <span className="theme-minimal-flat__suit">{suitSymbol(card)}</span>
      </span>
    </div>
  );
}
