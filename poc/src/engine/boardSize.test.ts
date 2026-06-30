import { describe, expect, it } from "vitest";
import { parseCard } from "@/engine/card";
import { createInitialState } from "@/engine/game";
import { Grid, boardCellCount, boardLineCount } from "@/engine/grid";
import { HandCategory, evaluateFour, evaluateLine } from "@/engine/hand";
import { scoreGridLive, scoreLine } from "@/engine/scoring";

function C(text: string) {
  return parseCard(text);
}

describe("4×4 board", () => {
  it("creates 16-cell grid", () => {
    const state = createInitialState(3, { boardSize: 4 });
    expect(state.boardSize).toBe(4);
    expect(state.gridCells).toHaveLength(16);
    expect(boardCellCount(4)).toBe(16);
    expect(boardLineCount(4)).toBe(10);
  });

  it("evaluates four-card two pair", () => {
    const hand = evaluateFour([C("Ah"), C("Ad"), C("Kc"), C("Ks")]);
    expect(hand.category).toBe(HandCategory.TwoPair);
  });

  it("evaluates four-card flush", () => {
    const hand = evaluateFour([C("2h"), C("5h"), C("9h"), C("Kh")]);
    expect(hand.category).toBe(HandCategory.Flush);
  });

  it("scores complete 4×4 grid lines", () => {
    const cells: (ReturnType<typeof C> | null)[] = Array(16).fill(null);
    const rowCards = [C("Ah"), C("Ad"), C("Kc"), C("Ks")];
    for (let col = 0; col < 4; col++) {
      cells[col] = rowCards[col];
    }
    const score = scoreGridLive(Grid.fromCells(cells, 4));
    expect(score.lines).toHaveLength(10);
    expect(score.total).toBeGreaterThan(0);
    const row0 = score.lines.find((l) => l.line === "row_0");
    expect(row0?.complete).toBe(true);
    expect(row0?.hand).toBe("Two Pair");
  });

  it("evaluateLine dispatches by card count", () => {
    expect(evaluateLine([C("Ah"), C("Ad"), C("Kc"), C("Ks")]).category).toBe(
      HandCategory.TwoPair,
    );
    expect(scoreLine([C("Ah"), C("Ad"), C("Kc"), C("Ks")]).points).toBeGreaterThan(10);
  });
});
