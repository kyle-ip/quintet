import type { Cell, Grid } from "./grid";
import { HandCategory } from "./hand";
import { handDisplayName, roundScore, scorePartialLine } from "./scoring";

export type LineKind = "row" | "col" | "diag_main" | "diag_anti";

export interface LineHighlight {
  lineId: string;
  kind: LineKind;
  label: string;
  category: HandCategory;
  handLabel: string;
  shortLabel: string;
  complete: boolean;
  points: number;
  positions: Cell[];
}

export interface CellAccent {
  category: HandCategory;
  handLabel: string;
  shortLabel: string;
  complete: boolean;
}

export interface CellAccents {
  row?: CellAccent;
  col?: CellAccent;
  diagMain?: CellAccent;
  diagAnti?: CellAccent;
}

const SHORT_HAND_LABELS: Partial<Record<HandCategory, string>> = {
  [HandCategory.OnePair]: "Pair",
  [HandCategory.TwoPair]: "2 Pair",
  [HandCategory.ThreeOfAKind]: "Trips",
  [HandCategory.Straight]: "Straight",
  [HandCategory.Flush]: "Flush",
  [HandCategory.FullHouse]: "Full House",
  [HandCategory.FourOfAKind]: "Quads",
  [HandCategory.StraightFlush]: "Str. Flush",
  [HandCategory.RoyalFlush]: "Royal",
};

export function handCategoryShortLabel(category: HandCategory, handKey: string): string {
  return SHORT_HAND_LABELS[category] ?? handDisplayName(handKey);
}

export function handCategoryCssVar(category: HandCategory): string {
  return `var(--hand-cat-${category})`;
}

function lineKind(lineId: string): LineKind {
  if (lineId.startsWith("row_")) return "row";
  if (lineId.startsWith("col_")) return "col";
  if (lineId === "diag_main") return "diag_main";
  return "diag_anti";
}

function lineLabel(lineId: string, kind: LineKind): string {
  if (kind === "row") return `Row ${Number(lineId.slice(4)) + 1}`;
  if (kind === "col") return `Col ${Number(lineId.slice(4)) + 1}`;
  if (kind === "diag_main") return "Main diagonal";
  return "Anti diagonal";
}

/** Lines that already form a hand better than high card (partial or complete). */
export function getQualifyingLineHighlights(grid: Grid): LineHighlight[] {
  const highlights: LineHighlight[] = [];

  for (const lineDef of grid.lines) {
    const partial = grid.partialLineCards(lineDef.positions);
    if (partial.length === 0) continue;

    const scored = scorePartialLine(partial, grid.size);
    if (!scored || scored.hand.category === HandCategory.HighCard) continue;

    const kind = lineKind(lineDef.id);
    highlights.push({
      lineId: lineDef.id,
      kind,
      label: lineLabel(lineDef.id, kind),
      category: scored.hand.category,
      handLabel: handDisplayName(scored.hand.name),
      shortLabel: handCategoryShortLabel(scored.hand.category, scored.hand.name),
      complete: partial.length === grid.size,
      points: roundScore(scored.points),
      positions: lineDef.positions,
    });
  }

  return highlights.sort((a, b) => {
    if (a.complete !== b.complete) return a.complete ? -1 : 1;
    return b.category - a.category;
  });
}

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function buildCellAccentMap(highlights: LineHighlight[]): Map<string, CellAccents> {
  const map = new Map<string, CellAccents>();

  for (const line of highlights) {
    const accent: CellAccent = {
      category: line.category,
      handLabel: line.handLabel,
      shortLabel: line.shortLabel,
      complete: line.complete,
    };

    for (const { row, col } of line.positions) {
      const key = cellKey(row, col);
      const existing = map.get(key) ?? {};
      switch (line.kind) {
        case "row":
          existing.row = accent;
          break;
        case "col":
          existing.col = accent;
          break;
        case "diag_main":
          existing.diagMain = accent;
          break;
        case "diag_anti":
          existing.diagAnti = accent;
          break;
      }
      map.set(key, existing);
    }
  }

  return map;
}

/** First cell on the line where a compact badge should appear. */
export function lineBadgeAnchor(highlight: LineHighlight, boardSize: number): Cell {
  switch (highlight.kind) {
    case "row":
      return { row: Number(highlight.lineId.slice(4)), col: 0 };
    case "col":
      return { row: 0, col: Number(highlight.lineId.slice(4)) };
    case "diag_main":
      return { row: 0, col: 0 };
    case "diag_anti":
      return { row: 0, col: boardSize - 1 };
  }
}

export function isQualifyingHandCategory(category: HandCategory): boolean {
  return category !== HandCategory.HighCard;
}
