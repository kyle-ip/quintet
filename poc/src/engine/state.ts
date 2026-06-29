import type { SoloGameState } from "@/engine/game";

export function cloneGameState(state: SoloGameState): SoloGameState {
  return {
    ...state,
    deck: [...state.deck],
    pool: [...state.pool],
    gridCells: [...state.gridCells],
  };
}
