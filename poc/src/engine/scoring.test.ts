import { describe, expect, it } from "vitest";
import { parseCard } from "@/engine/card";
import { Grid } from "@/engine/grid";
import { HandCategory } from "@/engine/hand";
import {
  detectExistingPartialHand,
  explainScoreV4,
  getCellScoreHint,
  lineDisplayName,
  scoreLine,
  scorePartialLine,
} from "@/engine/scoring";

function C(text: string) {
  return parseCard(text);
}

describe("score hints", () => {
  it("formats line names", () => {
    expect(lineDisplayName("row_0")).toBe("Row 1");
    expect(lineDisplayName("col_2")).toBe("Col 3");
    expect(lineDisplayName("diag_main")).toBe("Main diagonal");
  });

  it("explains one pair formula", () => {
    const cards = [C("8h"), C("8d"), C("Kc"), C("5s"), C("2h")];
    const { hand } = scoreLine(cards);
    expect(hand.category).toBe(HandCategory.OnePair);
    expect(explainScoreV4(hand)).toMatch(/^9 \+ 8×0\.1 \+ \d+×0\.05 = /);
  });

  it("sums complete lines through center cell", () => {
    const cells: (ReturnType<typeof C> | null)[] = Array(25).fill(null);
    for (let c = 0; c < 5; c++) {
      cells[2 * 5 + c] = C(`${c + 2}s`);
    }
    for (let r = 0; r < 5; r++) {
      cells[r * 5 + 2] = C("Ah");
    }
    cells[0] = C("Kd");
    cells[6] = C("Qd");
    cells[18] = C("Jd");
    cells[24] = C("10d");
    const grid = Grid.fromCells(cells);

    const hint = getCellScoreHint(grid, 2, 2);
    expect(hint.lines.length).toBeGreaterThanOrEqual(3);
    expect(hint.completeCount).toBeGreaterThan(0);
    expect(hint.total).toBeGreaterThan(0);
    const rowLine = hint.lines.find((l) => l.lineId === "row_2");
    expect(rowLine?.complete).toBe(true);
    expect(rowLine?.formula).toBeTruthy();
  });

  it("scores single card as high card only", () => {
    const hand = detectExistingPartialHand([C("As")]);
    expect(hand.category).toBe(HandCategory.HighCard);
    const scored = scorePartialLine([C("As")]);
    expect(scored!.points).toBeLessThan(10);

    const grid = new Grid();
    grid.place(2, 2, C("As"));
    const hint = getCellScoreHint(grid, 2, 2);
    expect(hint.completeCount).toBe(0);
    expect(hint.lines.every((l) => l.hand === "High Card")).toBe(true);
  });

  it("does not treat four suited cards as flush", () => {
    const partial = [C("As"), C("Ks"), C("Qs"), C("Js")];
    const hand = detectExistingPartialHand(partial);
    expect(hand.category).toBe(HandCategory.HighCard);

    const cells: (ReturnType<typeof C> | null)[] = Array(25).fill(null);
    cells[0] = partial[0];
    cells[1] = partial[1];
    cells[2] = partial[2];
    cells[3] = partial[3];
    const hint = getCellScoreHint(Grid.fromCells(cells), 0, 0);
    const row = hint.lines.find((l) => l.lineId === "row_0");
    expect(row?.hand).toBe("High Card");
    expect(row?.points).toBeLessThan(10);
  });

  it("detects three of a kind on partial line", () => {
    const hand = detectExistingPartialHand([C("Ah"), C("Ad"), C("Ac")]);
    expect(hand.category).toBe(HandCategory.ThreeOfAKind);
  });
});
