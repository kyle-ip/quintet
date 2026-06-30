import { describe, expect, it } from "vitest";
import { chooseGreedyAction, enumerateLegalActions } from "./ai";
import { createInitialState, placeFromPool } from "./game";

describe("chooseGreedyAction", () => {
  it("returns a legal action on an empty board", () => {
    const state = createInitialState(2);
    const action = chooseGreedyAction(state, () => 0);
    expect(action.poolIndex).toBeGreaterThanOrEqual(0);
    expect(action.poolIndex).toBeLessThan(state.pool.length);
    const keys = enumerateLegalActions(state).map(
      (a) => `${a.poolIndex}:${a.row},${a.col}`,
    );
    expect(keys).toContain(`${action.poolIndex}:${action.row},${action.col}`);
  });

  it("plays through a full 4×4 board without error", () => {
    let state = createInitialState(2, { boardSize: 4 });
    let steps = 0;
    while (state.status === "playing" && steps < 20) {
      const action = chooseGreedyAction(state, () => 0);
      state = placeFromPool(state, action.poolIndex, action.row, action.col);
      steps++;
    }
    expect(state.status).toBe("finished");
  });
});
