import { legalCellKeys } from "@/engine/game";
import { useGameStore } from "@/store/gameStore";

export interface QuintetTestApi {
  dropCard: (poolIndex: number, row: number, col: number) => void;
  getStatus: () => string;
  getTurn: () => number;
  getScore: () => number;
  playRandomLegalMove: () => boolean;
  playUntilFinished: () => number;
}

declare global {
  interface Window {
    __quintet?: QuintetTestApi;
  }
}

export function installTestHelpers(): void {
  window.__quintet = {
    dropCard: (poolIndex, row, col) => {
      useGameStore.getState().dropCard(poolIndex, row, col);
    },
    getStatus: () => useGameStore.getState().state.status,
    getTurn: () => useGameStore.getState().state.turn,
    getScore: () => useGameStore.getState().liveScore.total,
    playRandomLegalMove: () => {
      const state = useGameStore.getState().state;
      if (state.status === "finished") return false;
      const legal = legalCellKeys(state);
      if (legal.length === 0) return false;
      const [row, col] = legal[0].split(",").map(Number);
      useGameStore.getState().dropCard(0, row, col);
      return true;
    },
    playUntilFinished: () => {
      let moves = 0;
      while (useGameStore.getState().state.status !== "finished" && moves < 30) {
        if (!window.__quintet!.playRandomLegalMove()) break;
        moves += 1;
      }
      return moves;
    },
  };
}
