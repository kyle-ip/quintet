import { describe, expect, it } from "vitest";
import { parseCard } from "@/engine/card";
import { Grid } from "@/engine/grid";
import { HandCategory } from "@/engine/hand";
import {
  buildCellAccentMap,
  getQualifyingLineHighlights,
  lineBadgeAnchor,
} from "@/engine/lineHighlights";

function C(text: string) {
  return parseCard(text);
}

describe("line highlights", () => {
  it("highlights a row with three of a kind", () => {
    const cells: (ReturnType<typeof C> | null)[] = Array(25).fill(null);
    cells[2 * 5 + 0] = C("Ah");
    cells[2 * 5 + 1] = C("Ad");
    cells[2 * 5 + 2] = C("Ac");
    const grid = Grid.fromCells(cells);

    const highlights = getQualifyingLineHighlights(grid);
    expect(highlights).toHaveLength(1);
    expect(highlights[0]!.lineId).toBe("row_2");
    expect(highlights[0]!.category).toBe(HandCategory.ThreeOfAKind);
    expect(highlights[0]!.complete).toBe(false);
  });

  it("does not highlight high-card-only lines", () => {
    const grid = new Grid();
    grid.place(2, 2, C("As"));
    grid.place(2, 3, C("Kd"));

    expect(getQualifyingLineHighlights(grid)).toHaveLength(0);
  });

  it("assigns orthogonal accents without mixing row and col colors", () => {
    const cells: (ReturnType<typeof C> | null)[] = Array(25).fill(null);
    cells[2 * 5 + 0] = C("8h");
    cells[2 * 5 + 1] = C("8d");
    cells[2 * 5 + 3] = C("Qc");
    cells[0 * 5 + 3] = C("Kh");
    cells[1 * 5 + 3] = C("Kd");
    const grid = Grid.fromCells(cells);
    const highlights = getQualifyingLineHighlights(grid);
    const accents = buildCellAccentMap(highlights);

    const center = accents.get("2,3");
    expect(center?.row?.category).toBe(HandCategory.OnePair);
    expect(center?.col?.category).toBe(HandCategory.OnePair);
    expect(center?.row).not.toBe(center?.col);
  });

  it("anchors badges at line starts", () => {
    const rowLine = {
      lineId: "row_2",
      kind: "row" as const,
      label: "Row 3",
      category: HandCategory.OnePair,
      handLabel: "One Pair",
      shortLabel: "Pair",
      complete: false,
      points: 9,
      positions: [],
    };
    expect(lineBadgeAnchor(rowLine, 5)).toEqual({ row: 2, col: 0 });
  });
});
