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
  tapPlaceMode,
  selected,
  onSelect,
}: {
  card: Card;
  index: number;
  disabled: boolean;
  hidden: boolean;
  justDealt: boolean;
  registerSlot: (index: number, el: HTMLDivElement | null) => void;
  tapPlaceMode: boolean;
  selected: boolean;
  onSelect: (index: number) => void;
}) {
  const dragDisabled = disabled || tapPlaceMode;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${index}`,
    disabled: dragDisabled,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        registerSlot(index, el);
      }}
      style={{ ...style, zIndex: selected ? 40 : index + 1 }}
      className={[
        "pool-card",
        isDragging ? "pool-card--dragging" : "",
        hidden ? "pool-card--hidden" : "",
        justDealt ? "pool-card--dealt" : "",
        selected ? "pool-card--selected" : "",
        tapPlaceMode ? "pool-card--tap" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...(tapPlaceMode ? {} : listeners)}
      {...(tapPlaceMode ? {} : attributes)}
      onClick={
        tapPlaceMode && !disabled
          ? (e) => {
              e.stopPropagation();
              onSelect(index);
            }
          : undefined
      }
      role={tapPlaceMode ? "button" : undefined}
      aria-pressed={tapPlaceMode ? selected : undefined}
      aria-label={tapPlaceMode ? `Select card ${index + 1}` : undefined}
    >
      <PlayingCard card={card} variant="fill" />
    </div>
  );
}

interface PoolProps {
  disabled?: boolean;
  tapPlaceMode?: boolean;
  selectedIndex?: number | null;
  onSelectCard?: (index: number) => void;
}

export function Pool({
  disabled = false,
  tapPlaceMode = false,
  selectedIndex = null,
  onSelectCard,
}: PoolProps) {
  const pool = useGameStore((s) => s.state.pool);
  const poolSize = useGameStore((s) => s.poolSize);
  const deckCount = useGameStore((s) => s.state.deck.length);
  const { deckRef, registerSlot, hiddenIndices, dealtIndices, flights, deckDrawing } = usePoolDealFx();

  return (
    <div className="pool-column">
      <section className="pool-station" aria-label="Deck and card pool" data-testid="card-pool">
        <header className="pool-station-header">
          <span className="pool-station-title">
            {tapPlaceMode ? "Tap a card" : "Pick a card"}
          </span>
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
              <div
                className={`pool-cards pool-cards--stacked${tapPlaceMode ? " pool-cards--spread" : ""}`}
              >
                {pool.map((card, index) => (
                  <DraggablePoolCard
                    key={`${card.rank}-${card.suit}-${index}`}
                    card={card}
                    index={index}
                    disabled={disabled}
                    hidden={hiddenIndices.has(index)}
                    justDealt={dealtIndices.has(index)}
                    registerSlot={registerSlot}
                    tapPlaceMode={tapPlaceMode}
                    selected={selectedIndex === index}
                    onSelect={onSelectCard ?? (() => {})}
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
