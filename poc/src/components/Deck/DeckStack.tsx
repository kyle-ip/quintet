import { forwardRef, type CSSProperties } from "react";
import { CardBack } from "./CardBack";
import "./DeckStack.css";

interface DeckStackProps {
  count: number;
  drawing?: boolean;
}

export const DeckStack = forwardRef<HTMLDivElement, DeckStackProps>(function DeckStack(
  { count, drawing = false },
  ref,
) {
  const layers = Math.min(4, Math.max(1, Math.ceil(count / 13)));

  return (
    <div
      ref={ref}
      className={["deck-stack", drawing ? "deck-stack--drawing" : "", count === 0 ? "deck-stack--empty" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={count === 0 ? "Deck empty" : `Deck, ${count} cards remaining`}
    >
      <div className="deck-stack-pile">
        {Array.from({ length: layers }, (_, i) => (
          <CardBack key={i} className="deck-stack-card" style={{ "--layer": i } as CSSProperties} />
        ))}
      </div>
      <span className="deck-stack-count" aria-hidden="true">
        {count}
      </span>
    </div>
  );
});
