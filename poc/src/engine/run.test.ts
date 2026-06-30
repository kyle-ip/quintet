import { describe, expect, it } from "vitest";
import { parseCard } from "@/engine/card";
import { checkBoss } from "@/engine/bosses";
import { Grid } from "@/engine/grid";
import { HandCategory, evaluateFive } from "@/engine/hand";
import { createInitialState } from "@/engine/game";
import { scoreGridLive } from "@/engine/scoring";
import {
  ENDLESS_GATE_RELIEF_DELTA,
  evaluateEndlessFloor,
  getBossIdForFloor,
  getEffectiveGate,
  getEndlessBaseGate,
  getEndlessDeckSize,
  getEndlessGate,
  getEndlessPoolK,
  isBossFloor,
} from "@/engine/run";

function C(text: string) {
  return parseCard(text);
}

describe("endless gate formula", () => {
  it("matches steeper base gates than the original curve", () => {
    expect(getEndlessBaseGate(1)).toBe(110);
    expect(getEndlessBaseGate(3)).toBe(126);
    expect(getEndlessBaseGate(5)).toBe(135);
    expect(getEndlessBaseGate(10)).toBe(157.5);
  });

  it("scales base gates for 4×4 boards", () => {
    expect(getEndlessBaseGate(1, 4)).toBe(63.8);
    expect(getEndlessGate(5, undefined, 4)).toBe(81.2);
  });

  it("ramps after floor 10", () => {
    expect(getEndlessBaseGate(11)).toBe(161);
    expect(getEndlessBaseGate(15)).toBe(175);
  });

  it("adds boss bonus on boss floors", () => {
    expect(getEndlessGate(5)).toBe(140);
  });

  it("scales with run pace when player is far ahead", () => {
    const gate = getEndlessGate(5, { clearedScores: [240, 260, 250, 250] });
    expect(gate).toBe(220);
  });

  it("does not lower gate below base for weak runs", () => {
    const gate = getEndlessGate(5, { clearedScores: [120, 125, 118, 122] });
    expect(gate).toBe(140);
  });

  it("applies gate relief", () => {
    expect(getEffectiveGate(5, true, { clearedScores: [200, 200, 200, 200] }, 5)).toBe(166);
  });
});

describe("endless floor pressure", () => {
  it("reduces pool k by floor band", () => {
    expect(getEndlessPoolK(3, 5)).toBe(5);
    expect(getEndlessPoolK(6, 5)).toBe(4);
    expect(getEndlessPoolK(10, 5)).toBe(3);
    expect(getEndlessPoolK(10, 3)).toBe(2);
  });

  it("shrinks deck size by floor", () => {
    expect(getEndlessDeckSize(3, null)).toBe(52);
    expect(getEndlessDeckSize(7, null)).toBe(48);
    expect(getEndlessDeckSize(10, null)).toBe(45);
    expect(getEndlessDeckSize(10, "sparse_deck")).toBe(40);
  });
});

describe("boss floors", () => {
  it("occurs every 5 floors", () => {
    expect(isBossFloor(5)).toBe(true);
    expect(isBossFloor(4)).toBe(false);
  });

  it("rotates boss ids", () => {
    expect(getBossIdForFloor(5)).toBe("diagonal_duel");
    expect(getBossIdForFloor(10)).toBe("threshold_rush");
    expect(getBossIdForFloor(15)).toBe("sparse_deck");
    expect(getBossIdForFloor(20)).toBe("line_hunter");
  });
});

describe("createInitialState deckSize", () => {
  it("uses sub-deck when deckSize is set", () => {
    let seed = 1;
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const state = createInitialState(3, { deckSize: 45, rng });
    expect(state.deckSize).toBe(45);
    expect(state.deck.length).toBeLessThanOrEqual(45 - state.turn);
  });
});

describe("boss checks", () => {
  it("line hunter passes with two pair line", () => {
    const rowCards = [C("Ah"), C("Ad"), C("Kc"), C("Ks"), C("2h")];
    const cells: (ReturnType<typeof C> | null)[] = Array(25).fill(null);
    for (let col = 0; col < 5; col++) {
      cells[col] = rowCards[col];
    }
    const grid = Grid.fromCells(cells);
    const score = scoreGridLive(grid);
    expect(checkBoss("line_hunter", { score, grid, gate: 0, deckSize: 52 })).toBe(true);
  });

  it("diagonal duel requires both diagonals complete", () => {
    const cells: (ReturnType<typeof C> | null)[] = Array(25).fill(null);
    const grid = Grid.fromCells(cells);
    grid.place(0, 0, C("As"));
    const score = scoreGridLive(grid);
    expect(checkBoss("diagonal_duel", { score, grid, gate: 0, deckSize: 52 })).toBe(false);
  });
});

describe("evaluateEndlessFloor", () => {
  it("fails when below gate", () => {
    const grid = Grid.fromCells(Array(25).fill(null));
    const score = scoreGridLive(grid);
    const result = evaluateEndlessFloor(score, grid, {
      floor: 1,
      gateReliefActive: false,
    });
    expect(result.cleared).toBe(false);
    expect(result.failReason).toBe("gate");
  });
});

describe("hand evaluation sanity", () => {
  it("detects two pair", () => {
    const hand = evaluateFive([C("Ah"), C("Ad"), C("Kc"), C("Ks"), C("2h")]);
    expect(hand.category).toBe(HandCategory.TwoPair);
  });
});
