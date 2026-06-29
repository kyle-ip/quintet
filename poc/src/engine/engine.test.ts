import { describe, expect, it } from "vitest";
import { parseCard } from "@/engine/card";
import { HandCategory, evaluateFive } from "@/engine/hand";
import { Grid } from "@/engine/grid";
import { createInitialState, placeFromPool, POOL_SIZE_MAX } from "@/engine/game";
import { scoreGridLive } from "@/engine/scoring";

function C(text: string) {
  return parseCard(text);
}

describe("hand evaluation", () => {
  it("detects royal flush", () => {
    const hand = evaluateFive([C("As"), C("Ks"), C("Qs"), C("Js"), C("10s")]);
    expect(hand.category).toBe(HandCategory.RoyalFlush);
  });

  it("detects wheel straight", () => {
    const hand = evaluateFive([C("Ah"), C("2d"), C("3c"), C("4s"), C("5h")]);
    expect(hand.category).toBe(HandCategory.Straight);
    expect(hand.ranks[0]).toBe(5);
  });
});

describe("grid adjacency", () => {
  it("allows any cell first", () => {
    const grid = new Grid();
    expect(grid.legalPositions()).toHaveLength(25);
  });

  it("requires adjacency after first card", () => {
    const grid = new Grid();
    grid.place(2, 2, C("As"));
    const legal = grid.legalPositions();
    expect(legal).toContainEqual({ row: 1, col: 2 });
    expect(legal).toContainEqual({ row: 3, col: 3 });
    expect(legal).not.toContainEqual({ row: 0, col: 0 });
  });
});

describe("solo game", () => {
  it("completes 25 placements with seeded rng", () => {
    let seed = 0;
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    let state = createInitialState(2, rng);
    while (state.status === "playing") {
      const legal = legalPositionsFromState(state);
      const poolIndex = 0;
      const cell = legal[Math.floor(rng() * legal.length)];
      state = placeFromPool(state, poolIndex, cell.row, cell.col);
    }
    const score = scoreGridLive(Grid.fromCells(state.gridCells));
    expect(state.turn).toBe(25);
    expect(score.total).toBeGreaterThan(0);
  });
});

function legalPositionsFromState(state: ReturnType<typeof createInitialState>) {
  return Grid.fromCells(state.gridCells).legalPositions();
}

describe("pool size", () => {
  it(`accepts k up to ${POOL_SIZE_MAX}`, () => {
    const state = createInitialState(POOL_SIZE_MAX);
    expect(state.pool).toHaveLength(POOL_SIZE_MAX);
    expect(state.deck).toHaveLength(52 - POOL_SIZE_MAX);
  });

  it("does not refill pool after the final placement", () => {
    let seed = 99;
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    let state = createInitialState(1, rng);
    while (state.turn < 24) {
      const grid = Grid.fromCells(state.gridCells);
      const legal = grid.legalPositions();
      const cell = legal[Math.floor(rng() * legal.length)];
      state = placeFromPool(state, 0, cell.row, cell.col);
    }
    const deckBefore = state.deck.length;
    const grid = Grid.fromCells(state.gridCells);
    const lastCell = grid.legalPositions()[0];
    const finished = placeFromPool(state, 0, lastCell.row, lastCell.col);
    expect(finished.status).toBe("finished");
    expect(finished.deck.length).toBe(deckBefore);
  });
});

describe("live scoring", () => {
  it("counts only complete lines", () => {
    const grid = new Grid();
    for (let c = 0; c < 5; c++) {
      grid.place(0, c, C(`${c + 2}s`));
    }
    const snap = scoreGridLive(grid);
    expect(snap.lines.find((l) => l.line === "row_0")?.complete).toBe(true);
    expect(snap.lines.find((l) => l.line === "row_1")?.complete).toBe(false);
    expect(snap.total).toBeGreaterThan(0);
  });
});
