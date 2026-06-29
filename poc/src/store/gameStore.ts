import { create } from "zustand";
import {
  createInitialState,
  placeFromPool,
  type SoloGameState,
} from "@/engine/game";
import { cloneGameState } from "@/engine/state";
import { Grid } from "@/engine/grid";
import { scoreGridLive, type ScoreSnapshot } from "@/engine/scoring";
import {
  DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
  getCardTheme,
  resolveThemeId,
  type CardThemeId,
} from "@themes/index";
import {
  applyColorMode,
  COLOR_MODE_STORAGE_KEY,
  DEFAULT_COLOR_MODE,
  resolveColorMode,
  type ColorMode,
} from "@/config/colorMode";

const MAX_UNDO = 25;

interface GameStore {
  poolSize: number;
  state: SoloGameState;
  liveScore: ScoreSnapshot;
  history: SoloGameState[];
  actionCount: number;
  themeId: CardThemeId;
  colorMode: ColorMode;
  dealSignal: number;
  lastDealStartIndex: number;
  lastDealCount: number;
  /** Wall-clock ms when first card is placed; null until then. */
  timerStartAt: number | null;
  /** Wall-clock ms when the board is filled; null while playing. */
  timerStoppedAt: number | null;
  initGame: (poolSize?: number) => void;
  dropCard: (poolIndex: number, row: number, col: number) => void;
  undo: () => void;
  canUndo: () => boolean;
  setThemeId: (id: CardThemeId) => void;
  setColorMode: (mode: ColorMode) => void;
}

function computeDealDraw(
  state: SoloGameState,
  next: SoloGameState,
): { start: number; count: number } | null {
  const drawn = state.deck.length - next.deck.length;
  if (drawn <= 0) return null;
  const poolAfterRemoval = state.pool.length - 1;
  const added = next.pool.length - poolAfterRemoval;
  if (added > 0 && added === drawn) {
    return { start: poolAfterRemoval, count: added };
  }
  return null;
}

function withLiveScore(state: SoloGameState): ScoreSnapshot {
  return scoreGridLive(Grid.fromCells(state.gridCells));
}

function loadThemeId(): CardThemeId {
  if (typeof localStorage === "undefined") {
    return DEFAULT_THEME_ID;
  }
  return resolveThemeId(localStorage.getItem(THEME_STORAGE_KEY));
}

function loadColorMode(): ColorMode {
  if (typeof localStorage === "undefined") {
    return DEFAULT_COLOR_MODE;
  }
  return resolveColorMode(localStorage.getItem(COLOR_MODE_STORAGE_KEY));
}

if (typeof document !== "undefined") {
  applyColorMode(loadColorMode());
}

export const useGameStore = create<GameStore>((set, get) => ({
  poolSize: 2,
  state: createInitialState(2),
  liveScore: withLiveScore(createInitialState(2)),
  history: [],
  actionCount: 0,
  themeId: loadThemeId(),
  colorMode: loadColorMode(),
  dealSignal: 1,
  lastDealStartIndex: 0,
  lastDealCount: 2,
  timerStartAt: null,
  timerStoppedAt: null,

  initGame: (poolSize = get().poolSize) => {
    const state = createInitialState(poolSize);
    set({
      poolSize,
      state,
      liveScore: withLiveScore(state),
      history: [],
      actionCount: 0,
      dealSignal: get().dealSignal + 1,
      lastDealStartIndex: 0,
      lastDealCount: state.pool.length,
      timerStartAt: null,
      timerStoppedAt: null,
    });
  },

  dropCard: (poolIndex, row, col) => {
    const { state, history, actionCount, timerStartAt, timerStoppedAt } = get();
    try {
      const snapshot = cloneGameState(state);
      const next = placeFromPool(state, poolIndex, row, col);
      const deal = computeDealDraw(state, next);
      const nextHistory = [...history, snapshot].slice(-MAX_UNDO);
      let nextTimerStart = timerStartAt;
      let nextTimerStopped = timerStoppedAt;
      if (state.turn === 0 && nextTimerStart === null) {
        nextTimerStart = Date.now();
      }
      if (next.status === "finished") {
        nextTimerStopped = Date.now();
      }
      set({
        state: next,
        liveScore: withLiveScore(next),
        history: nextHistory,
        actionCount: actionCount + 1,
        timerStartAt: nextTimerStart,
        timerStoppedAt: nextTimerStopped,
        ...(deal
          ? {
              dealSignal: get().dealSignal + 1,
              lastDealStartIndex: deal.start,
              lastDealCount: deal.count,
            }
          : {}),
      });
    } catch {
      // ignore invalid drops
    }
  },

  undo: () => {
    const { history, actionCount, timerStoppedAt } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      state: cloneGameState(previous),
      liveScore: withLiveScore(previous),
      history: history.slice(0, -1),
      actionCount: actionCount + 1,
      ...(previous.status === "playing" && timerStoppedAt !== null
        ? { timerStoppedAt: null }
        : {}),
    });
  },

  canUndo: () => get().history.length > 0,

  setThemeId: (id) => {
    getCardTheme(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    set({ themeId: id });
  },

  setColorMode: (mode) => {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
    applyColorMode(mode);
    set({ colorMode: mode });
  },
}));
