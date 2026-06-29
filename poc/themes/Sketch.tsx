import type { CardFaceProps } from "./types";
import { isRedSuit, rankLabel, suitSymbol } from "./utils";
import "./styles/sketch.css";

export function SketchPaper({ card, className }: CardFaceProps) {
  const red = isRedSuit(card.suit);
  return (
    <div
      className={[
        "theme-sketch",
        red ? "is-red" : "is-black",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="theme-sketch__corner theme-sketch__corner--tl">
        <span className="theme-sketch__rank">{rankLabel(card)}</span>
        <span className="theme-sketch__suit">{suitSymbol(card)}</span>
      </span>
      <span className="theme-sketch__center" aria-hidden="true">
        {suitSymbol(card)}
      </span>
      <span className="theme-sketch__corner theme-sketch__corner--br">
        <span className="theme-sketch__rank">{rankLabel(card)}</span>
        <span className="theme-sketch__suit">{suitSymbol(card)}</span>
      </span>
      <span className="theme-sketch__scribble" aria-hidden="true" />
    </div>
  );
}
