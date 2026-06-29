import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/engine/card";
import { PlayingCard } from "@/components/Card/PlayingCard";
import { DeckStack } from "@/components/Deck/DeckStack";
import { useGameStore } from "@/store/gameStore";
import { PoolDealFlyover } from "./PoolDealFlyover";
import { usePoolDealFx } from "./usePoolDealFx";
import "./Pool.css";

function DraggablePoolCard({
  card,
  index,
  disabled,
  hidden,
  justDealt,
  registerSlot,
}: {
  card: Card;
  index: number;
  disabled: boolean;
  hidden: boolean;
  justDealt: boolean;
  registerSlot: (index: number, el: HTMLDivElement | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${index}`,
    disabled,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        registerSlot(index, el);
      }}
      style={{ ...style, zIndex: index + 1 }}
      className={[
        "pool-card",
        isDragging ? "pool-card--dragging" : "",
        hidden ? "pool-card--hidden" : "",
        justDealt ? "pool-card--dealt" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...listeners}
      {...attributes}
    >
      <PlayingCard card={card} variant="fill" />
    </div>
  );
}

interface PoolProps {
  disabled?: boolean;
}

export function Pool({ disabled = false }: PoolProps) {
  const pool = useGameStore((s) => s.state.pool);
  const poolSize = useGameStore((s) => s.poolSize);
  const deckCount = useGameStore((s) => s.state.deck.length);
  const { deckRef, registerSlot, hiddenIndices, dealtIndices, flights, deckDrawing } = usePoolDealFx();

  return (
    <div className="pool-column">
      <section className="pool-station" aria-label="Deck and card pool">
        <header className="pool-station-header">
          <span className="pool-station-title">Pick a card</span>
          <span className="pool-station-meta" aria-label={`${pool.length} of ${poolSize} in pool`}>
            {pool.length}/{poolSize}
          </span>
        </header>

        <div className="pool-station-surface">
          <div className="pool-station-deck">
            <DeckStack ref={deckRef} count={deckCount} drawing={deckDrawing} />
            <span className="pool-station-deck-label">Deck</span>
          </div>

          <div className="pool-station-bridge" aria-hidden="true">
            <span className="pool-station-arrow" />
          </div>

          <div className="pool-station-spread" aria-label="Card pool">
            {pool.length === 0 ? (
              <div className="pool-empty">
                <span className="pool-empty-icon" aria-hidden="true" />
                <span>Refilling…</span>
              </div>
            ) : (
              <div className="pool-cards pool-cards--stacked">
                {pool.map((card, index) => (
                  <DraggablePoolCard
                    key={`${card.rank}-${card.suit}-${index}`}
                    card={card}
                    index={index}
                    disabled={disabled}
                    hidden={hiddenIndices.has(index)}
                    justDealt={dealtIndices.has(index)}
                    registerSlot={registerSlot}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <PoolDealFlyover flights={flights} />
    </div>
  );
}
