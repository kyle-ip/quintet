import { useMemo, type CSSProperties } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Card } from "@/engine/card";
import { boardCellCount } from "@/engine/grid";
import { getCellScoreHint } from "@/engine/scoring";
import { gridFromState } from "@/engine/game";
import {
  buildCellAccentMap,
  getQualifyingLineHighlights,
  lineBadgeAnchor,
  type CellAccents,
  type LineHighlight,
} from "@/engine/lineHighlights";
import { PlayingCard } from "@/components/Card/PlayingCard";
import { CardLineTooltip } from "@/components/Board/CardLineTooltip";
import { BoardLineAccents } from "@/components/Board/BoardLineAccents";
import { LineHandBadgeStack } from "@/components/Board/BoardLineBadges";
import { useGameStore } from "@/store/gameStore";
import "./Board.css";
import "./CardLineTooltip.css";
import "./BoardLineAccents.css";
import "./BoardLineBadges.css";

interface BoardProps {
  legalDropKeys: Set<string>;
  isDragging: boolean;
  lastPlacedKey?: string | null;
  tapPlaceMode?: boolean;
  onCellTap?: (row: number, col: number) => void;
}

function GridCell({
  row,
  col,
  cellKey,
  card,
  canDrop,
  isDragging,
  justPlaced,
  accents,
  badgeLines,
  tapPlaceMode,
  onCellTap,
}: {
  row: number;
  col: number;
  cellKey: string;
  card: Card | null;
  canDrop: boolean;
  isDragging: boolean;
  justPlaced: boolean;
  accents: CellAccents | undefined;
  badgeLines: LineHighlight[];
  tapPlaceMode: boolean;
  onCellTap?: (row: number, col: number) => void;
}) {
  const state = useGameStore((s) => s.state);
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${cellKey}`,
    disabled: card !== null || !canDrop,
  });

  const hint = useMemo(() => {
    if (!card) return null;
    return getCellScoreHint(gridFromState(state), row, col);
  }, [card, state, row, col]);

  const hasLineAccent = accents !== undefined;

  let className = "grid-cell";
  if (card) className += " grid-cell-filled grid-cell-has-tooltip";
  if (hasLineAccent) className += " grid-cell-has-line-accent";
  if (justPlaced) className += " grid-cell-just-placed";
  if (row <= 1 && card) className += " tooltip-below";
  if (isDragging && canDrop) className += " grid-cell-droppable";
  if (isOver && canDrop) className += " grid-cell-over";
  if (tapPlaceMode && canDrop && isDragging) className += " grid-cell-tap-target";

  function handleCellClick() {
    if (!tapPlaceMode || !canDrop || !isDragging || !onCellTap) return;
    onCellTap(row, col);
  }

  return (
    <div
      ref={setNodeRef}
      className={className}
      data-row={row}
      data-col={col}
      onClick={tapPlaceMode && canDrop && isDragging ? handleCellClick : undefined}
      role={tapPlaceMode && canDrop && isDragging ? "button" : undefined}
      tabIndex={tapPlaceMode && canDrop && isDragging ? 0 : undefined}
      onKeyDown={
        tapPlaceMode && canDrop && isDragging
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCellTap?.(row, col);
              }
            }
          : undefined
      }
    >
      {hasLineAccent ? <BoardLineAccents accents={accents} /> : null}
      {badgeLines.length > 0 ? <LineHandBadgeStack lines={badgeLines} /> : null}
      {card ? (
        <>
          <PlayingCard card={card} variant="fill" justPlaced={justPlaced} />
          {hint ? <CardLineTooltip hint={hint} /> : null}
        </>
      ) : (
        <span className="grid-cell-empty">·</span>
      )}
    </div>
  );
}

export function Board({
  legalDropKeys,
  isDragging,
  lastPlacedKey = null,
  tapPlaceMode = false,
  onCellTap,
}: BoardProps) {
  const state = useGameStore((s) => s.state);
  const boardSize = state.boardSize;
  const cells = boardCellCount(boardSize);

  const { accentMap, badgeMap } = useMemo(() => {
    const grid = gridFromState(state);
    const highlights = getQualifyingLineHighlights(grid);
    const accents = buildCellAccentMap(highlights);
    const badges = new Map<string, LineHighlight[]>();

    for (const line of highlights) {
      const anchor = lineBadgeAnchor(line, boardSize);
      const key = `${anchor.row},${anchor.col}`;
      badges.set(key, [...(badges.get(key) ?? []), line]);
    }

    return { accentMap: accents, badgeMap: badges };
  }, [state, boardSize]);

  return (
    <section
      className="board"
      aria-label={`${boardSize} by ${boardSize} grid`}
      data-testid="game-board"
      style={{ "--board-cols": boardSize } as CSSProperties}
    >
      <div className="board-inner">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${boardSize}, var(--cell-size))` }}
        >
          {Array.from({ length: cells }, (_, i) => {
            const row = Math.floor(i / boardSize);
            const col = i % boardSize;
            const key = `${row},${col}`;
            return (
              <GridCell
                key={key}
                row={row}
                col={col}
                cellKey={key}
                card={state.gridCells[i]}
                canDrop={legalDropKeys.has(key)}
                isDragging={isDragging}
                justPlaced={lastPlacedKey === key}
                accents={accentMap.get(key)}
                badgeLines={badgeMap.get(key) ?? []}
                tapPlaceMode={tapPlaceMode}
                onCellTap={onCellTap}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
