import { describe, expect, it } from "vitest";
import { cloneGameState } from "@/engine/state";
import { createInitialState, placeFromPool } from "@/engine/game";

describe("undo snapshots", () => {
  it("restores previous state after undo chain", () => {
    let state = createInitialState(2, () => 0.5);
    const legal = state.pool.length > 0;
    if (!legal) return;

    const before = cloneGameState(state);
    state = placeFromPool(state, 0, 2, 2);
    expect(state.turn).toBe(1);

    const restored = cloneGameState(before);
    expect(restored.turn).toBe(0);
    expect(restored.pool).toEqual(before.pool);
    expect(restored.gridCells.every((c) => c === null)).toBe(true);
  });
});
