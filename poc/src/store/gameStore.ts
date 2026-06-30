import { create } from "zustand";
import {
  createInitialState,
  DEFAULT_POOL_SIZE,
  gridFromState,
  placeFromPool,
  type SoloGameState,
} from "@/engine/game";
import { cloneGameState } from "@/engine/state";
import { DEFAULT_BOARD_SIZE, type BoardSize, boardCellCount } from "@/engine/grid";
import { scoreGridLive, type ScoreSnapshot } from "@/engine/scoring";
import {
  ENDLESS_STARTING_LIVES,
  ENDLESS_UNDO_PER_FLOOR,
  evaluateEndlessFloor,
  getBossIdForFloor,
  getEffectiveGate,
  getEndlessDeckSize,
  getEndlessPoolK,
  saveEndlessBestIfBetter,
  type FloorEvaluation,
} from "@/engine/run";
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

const MAX_UNDO_CLASSIC_CAP = 25;

export type GameMode = "classic" | "endless";

export interface EndlessRunState {
  floor: number;
  lives: number;
  totalScore: number;
  startingPoolK: number;
  maxFloorCleared: number;
  clearedScores: number[];
  gateReliefActive: boolean;
  gateReliefUsedThisFloor: boolean;
  pendingFloorResult: FloorEvaluation | null;
  runOver: boolean;
}

interface GameStore {
  gameMode: GameMode;
  boardSize: BoardSize;
  poolSize: number;
  state: SoloGameState;
  liveScore: ScoreSnapshot;
  history: SoloGameState[];
  actionCount: number;
  undoUsesThisFloor: number;
  themeId: CardThemeId;
  colorMode: ColorMode;
  dealSignal: number;
  lastDealStartIndex: number;
  lastDealCount: number;
  timerStartAt: number | null;
  timerStoppedAt: number | null;
  endlessRun: EndlessRunState | null;
  showFloorBanner: boolean;
  initGame: (poolSize?: number) => void;
  startEndlessRun: (poolSize?: number) => void;
  setGameMode: (mode: GameMode) => void;
  continueEndlessFloor: () => void;
  retryEndlessFloor: (withGateRelief: boolean) => void;
  endEndlessRun: () => void;
  dismissFloorBanner: () => void;
  dropCard: (poolIndex: number, row: number, col: number) => void;
  undo: () => void;
  canUndo: () => boolean;
  getUndoLimit: () => number | null;
  getEndlessFloorTarget: () => number | null;
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
  return scoreGridLive(gridFromState(state));
}

function freshBoardState(poolSize: number, deckSize: number, boardSize: BoardSize): SoloGameState {
  return createInitialState(poolSize, { deckSize, boardSize });
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

function resetBoardFields(state: SoloGameState, liveScore: ScoreSnapshot, dealSignal: number) {
  return {
    state,
    liveScore,
    history: [] as SoloGameState[],
    actionCount: 0,
    undoUsesThisFloor: 0,
    dealSignal,
    lastDealStartIndex: 0,
    lastDealCount: state.pool.length,
    timerStartAt: null as number | null,
    timerStoppedAt: null as number | null,
    showFloorBanner: true,
  };
}

if (typeof document !== "undefined") {
  applyColorMode(loadColorMode());
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameMode: "classic",
  boardSize: DEFAULT_BOARD_SIZE,
  poolSize: DEFAULT_POOL_SIZE,
  state: createInitialState(DEFAULT_POOL_SIZE),
  liveScore: withLiveScore(createInitialState(DEFAULT_POOL_SIZE)),
  history: [],
  actionCount: 0,
  undoUsesThisFloor: 0,
  themeId: loadThemeId(),
  colorMode: loadColorMode(),
  dealSignal: 1,
  lastDealStartIndex: 0,
  lastDealCount: DEFAULT_POOL_SIZE,
  timerStartAt: null,
  timerStoppedAt: null,
  endlessRun: null,
  showFloorBanner: false,

  initGame: (poolSize = get().poolSize) => {
    const boardSize = get().boardSize;
    const state = createInitialState(poolSize, { boardSize });
    set({
      gameMode: "classic",
      poolSize,
      boardSize,
      endlessRun: null,
      ...resetBoardFields(state, withLiveScore(state), get().dealSignal + 1),
      showFloorBanner: false,
    });
  },

  startEndlessRun: (poolSize = get().poolSize) => {
    const startingPoolK = poolSize;
    const boardSize = get().boardSize;
    const run: EndlessRunState = {
      floor: 1,
      lives: ENDLESS_STARTING_LIVES,
      totalScore: 0,
      startingPoolK,
      maxFloorCleared: 0,
      clearedScores: [],
      gateReliefActive: false,
      gateReliefUsedThisFloor: false,
      pendingFloorResult: null,
      runOver: false,
    };
    const floorPoolK = getEndlessPoolK(1, startingPoolK);
    const bossId = getBossIdForFloor(1);
    const deckSize = getEndlessDeckSize(1, bossId, boardSize);
    const state = freshBoardState(floorPoolK, deckSize, boardSize);
    set({
      gameMode: "endless",
      poolSize: startingPoolK,
      endlessRun: run,
      ...resetBoardFields(state, withLiveScore(state), get().dealSignal + 1),
    });
  },

  setGameMode: (mode) => {
    if (mode === get().gameMode) return;
    if (mode === "classic") {
      get().initGame(get().poolSize);
      return;
    }
    get().startEndlessRun(get().poolSize);
  },

  continueEndlessFloor: () => {
    const { endlessRun, boardSize } = get();
    if (!endlessRun?.pendingFloorResult?.cleared) return;
    const clearedFloor = endlessRun.floor;
    const clearedScore = endlessRun.pendingFloorResult.score;
    const nextRun: EndlessRunState = {
      ...endlessRun,
      floor: clearedFloor + 1,
      maxFloorCleared: Math.max(endlessRun.maxFloorCleared, clearedFloor),
      totalScore: endlessRun.totalScore + clearedScore,
      clearedScores: [...endlessRun.clearedScores, clearedScore],
      pendingFloorResult: null,
      gateReliefActive: false,
      gateReliefUsedThisFloor: false,
      runOver: false,
    };
    const floorPoolK = getEndlessPoolK(nextRun.floor, nextRun.startingPoolK);
    const bossId = getBossIdForFloor(nextRun.floor);
    const deckSize = getEndlessDeckSize(nextRun.floor, bossId, boardSize);
    const state = freshBoardState(floorPoolK, deckSize, boardSize);
    set({
      endlessRun: nextRun,
      ...resetBoardFields(state, withLiveScore(state), get().dealSignal + 1),
    });
  },

  retryEndlessFloor: (withGateRelief) => {
    const { endlessRun, boardSize } = get();
    if (!endlessRun || endlessRun.runOver || endlessRun.lives <= 0) return;
    if (withGateRelief && endlessRun.gateReliefUsedThisFloor) return;
    const nextRun: EndlessRunState = {
      ...endlessRun,
      pendingFloorResult: null,
      gateReliefActive: withGateRelief ? true : endlessRun.gateReliefActive,
      gateReliefUsedThisFloor: withGateRelief ? true : endlessRun.gateReliefUsedThisFloor,
      runOver: false,
    };
    const floorPoolK = getEndlessPoolK(nextRun.floor, nextRun.startingPoolK);
    const bossId = getBossIdForFloor(nextRun.floor);
    const deckSize = getEndlessDeckSize(nextRun.floor, bossId, boardSize);
    const state = freshBoardState(floorPoolK, deckSize, boardSize);
    set({
      endlessRun: nextRun,
      ...resetBoardFields(state, withLiveScore(state), get().dealSignal + 1),
    });
  },

  endEndlessRun: () => {
    const { endlessRun } = get();
    if (endlessRun) {
      saveEndlessBestIfBetter(
        endlessRun.maxFloorCleared,
        endlessRun.totalScore,
        endlessRun.startingPoolK,
      );
    }
    set({
      endlessRun: endlessRun
        ? { ...endlessRun, runOver: true, pendingFloorResult: null }
        : null,
      showFloorBanner: false,
    });
  },

  dismissFloorBanner: () => set({ showFloorBanner: false }),

  dropCard: (poolIndex, row, col) => {
    const { state, history, actionCount, timerStartAt, timerStoppedAt, gameMode, endlessRun } =
      get();
    try {
      const snapshot = cloneGameState(state);
      const next = placeFromPool(state, poolIndex, row, col);
      const deal = computeDealDraw(state, next);
      const maxUndo =
        gameMode === "endless"
          ? ENDLESS_UNDO_PER_FLOOR
          : Math.min(boardCellCount(state.boardSize), MAX_UNDO_CLASSIC_CAP);
      const nextHistory = [...history, snapshot].slice(-maxUndo);
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
        showFloorBanner: false,
        ...(deal
          ? {
              dealSignal: get().dealSignal + 1,
              lastDealStartIndex: deal.start,
              lastDealCount: deal.count,
            }
          : {}),
      });

      if (next.status === "finished" && gameMode === "endless" && endlessRun && !endlessRun.runOver) {
        const grid = gridFromState(next);
        const liveScore = withLiveScore(next);
        const evaluation = evaluateEndlessFloor(liveScore, grid, {
          floor: endlessRun.floor,
          gateReliefActive: endlessRun.gateReliefActive,
          gateContext: { clearedScores: endlessRun.clearedScores },
          boardSize: next.boardSize,
        });
        const updatedRun: EndlessRunState = { ...endlessRun, pendingFloorResult: evaluation };
        if (evaluation.cleared) {
          set({ endlessRun: updatedRun });
        } else {
          const newLives = endlessRun.lives - 1;
          const runOver = newLives <= 0;
          if (runOver) {
            saveEndlessBestIfBetter(
              endlessRun.maxFloorCleared,
              endlessRun.totalScore,
              endlessRun.startingPoolK,
            );
          }
          set({
            endlessRun: {
              ...updatedRun,
              lives: newLives,
              runOver,
            },
          });
        }
      }
    } catch {
      // ignore invalid drops
    }
  },

  undo: () => {
    const { history, actionCount, timerStoppedAt, gameMode, undoUsesThisFloor } = get();
    if (history.length === 0) return;
    if (gameMode === "endless" && undoUsesThisFloor >= ENDLESS_UNDO_PER_FLOOR) return;
    const previous = history[history.length - 1];
    set({
      state: cloneGameState(previous),
      liveScore: withLiveScore(previous),
      history: history.slice(0, -1),
      actionCount: actionCount + 1,
      undoUsesThisFloor: gameMode === "endless" ? undoUsesThisFloor + 1 : undoUsesThisFloor,
      ...(previous.status === "playing" && timerStoppedAt !== null
        ? { timerStoppedAt: null }
        : {}),
    });
  },

  canUndo: () => {
    const { history, gameMode, undoUsesThisFloor } = get();
    if (history.length === 0) return false;
    if (gameMode === "endless" && undoUsesThisFloor >= ENDLESS_UNDO_PER_FLOOR) return false;
    return true;
  },

  getUndoLimit: () => {
    if (get().gameMode === "endless") return ENDLESS_UNDO_PER_FLOOR;
    return null;
  },

  getEndlessFloorTarget: () => {
    const { gameMode, endlessRun, boardSize } = get();
    if (gameMode !== "endless" || !endlessRun) return null;
    return getEffectiveGate(
      endlessRun.floor,
      endlessRun.gateReliefActive,
      { clearedScores: endlessRun.clearedScores },
      boardSize,
    );
  },

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
