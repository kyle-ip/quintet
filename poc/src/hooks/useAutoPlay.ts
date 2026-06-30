import { useEffect, useRef } from "react";
import { chooseGreedyAction } from "@/engine/ai";
import type { SoloGameState } from "@/engine/game";
import type { FloorEvaluation } from "@/engine/run";

const STEP_MS = 1500;

interface UseAutoPlayOptions {
  autoPlay: boolean;
  state: SoloGameState;
  dropCard: (poolIndex: number, row: number, col: number) => void;
  onPlaced: (row: number, col: number) => void;
  blocked: boolean;
  floorResultOpen: boolean;
  pendingFloorResult: FloorEvaluation | null | undefined;
  lives: number;
  onContinueFloor: () => void;
  onRetryFloor: () => void;
  onEndRun: () => void;
}

export function useAutoPlay({
  autoPlay,
  state,
  dropCard,
  onPlaced,
  blocked,
  floorResultOpen,
  pendingFloorResult,
  lives,
  onContinueFloor,
  onRetryFloor,
  onEndRun,
}: UseAutoPlayOptions): void {
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!autoPlay || blocked || state.status !== "playing") return;

    const timer = setInterval(() => {
      const current = stateRef.current;
      if (current.status !== "playing") return;
      try {
        const { poolIndex, row, col } = chooseGreedyAction(current);
        dropCard(poolIndex, row, col);
        onPlaced(row, col);
      } catch {
        // No legal moves — wait for next tick.
      }
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [autoPlay, blocked, state.status, dropCard, onPlaced]);

  useEffect(() => {
    if (!autoPlay || !floorResultOpen || !pendingFloorResult) return;

    const timer = setTimeout(() => {
      if (pendingFloorResult.cleared) {
        onContinueFloor();
      } else if (lives > 0) {
        onRetryFloor();
      } else {
        onEndRun();
      }
    }, STEP_MS);

    return () => clearTimeout(timer);
  }, [
    autoPlay,
    floorResultOpen,
    pendingFloorResult,
    lives,
    onContinueFloor,
    onRetryFloor,
    onEndRun,
  ]);
}
