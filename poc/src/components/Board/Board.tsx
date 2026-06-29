import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Card } from "@/engine/card";
import { GRID_SIZE, Grid } from "@/engine/grid";
import { getCellScoreHint } from "@/engine/scoring";
import { PlayingCard } from "@/components/Card/PlayingCard";
import { CardLineTooltip } from "@/components/Board/CardLineTooltip";
import { useGameStore } from "@/store/gameStore";
import "./Board.css";
import "./CardLineTooltip.css";

interface BoardProps {
  legalDropKeys: Set<string>;
  isDragging: boolean;
  lastPlacedKey?: string | null;
}

function GridCell({
  row,
  col,
  cellKey,
  card,
  canDrop,
  isDragging,
  justPlaced,
}: {
  row: number;
  col: number;
  cellKey: string;
  card: Card | null;
  canDrop: boolean;
  isDragging: boolean;
  justPlaced: boolean;
}) {
  const gridCells = useGameStore((s) => s.state.gridCells);
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${cellKey}`,
    disabled: card !== null || !canDrop,
  });

  const hint = useMemo(() => {
    if (!card) return null;
    return getCellScoreHint(Grid.fromCells(gridCells), row, col);
  }, [card, gridCells, row, col]);

  let className = "grid-cell";
  if (card) className += " grid-cell-filled grid-cell-has-tooltip";
  if (justPlaced) className += " grid-cell-just-placed";
  if (row <= 1 && card) className += " tooltip-below";
  if (isDragging && canDrop) className += " grid-cell-droppable";
  if (isOver && canDrop) className += " grid-cell-over";

  return (
    <div ref={setNodeRef} className={className} data-row={row} data-col={col}>
      {card ? (
        <>
          <PlayingCard card={card} variant="fill" justPlaced={justPlaced} />
          {hint && <CardLineTooltip hint={hint} />}
        </>
      ) : (
        <span className="grid-cell-empty">·</span>
      )}
    </div>
  );
}

export function Board({ legalDropKeys, isDragging, lastPlacedKey = null }: BoardProps) {
  const gridCells = useGameStore((s) => s.state.gridCells);

  return (
    <section className="board" aria-label="5 by 5 grid">
      <div className="board-inner">
        <div className="grid">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            const key = `${row},${col}`;
            return (
              <GridCell
                key={key}
                row={row}
                col={col}
                cellKey={key}
                card={gridCells[i]}
                canDrop={legalDropKeys.has(key)}
                isDragging={isDragging}
                justPlaced={lastPlacedKey === key}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
