import type { BossId } from "./bosses";
import { BOSS_IDS, checkBoss } from "./bosses";
import { type BoardSize, Grid } from "./grid";
import { roundScore, type ScoreSnapshot } from "./scoring";

export const ENDLESS_BOSS_INTERVAL = 5;
export const ENDLESS_STARTING_LIVES = 3;
export const ENDLESS_UNDO_PER_FLOOR = 3;
export const ENDLESS_GATE_RELIEF_DELTA = 10;
export const ENDLESS_LEADERBOARD_KEY = "quintet-endless-best";

/** v4 Monte Carlo mean — baseline for adaptive scaling */
export const ENDLESS_V4_MEAN = 123.5;

export type DeckSize = 52 | 48 | 45 | 40 | 36 | 28;

const FOUR_BY_FOUR_GATE_SCALE = 0.58;

function scaleGateForBoard(gate: number, boardSize: BoardSize): number {
  return boardSize === 4 ? roundScore(gate * FOUR_BY_FOUR_GATE_SCALE) : gate;
}

function gateReliefForBoard(boardSize: BoardSize): number {
  return boardSize === 4 ? 6 : ENDLESS_GATE_RELIEF_DELTA;
}

export interface EndlessGateContext {
  /** Scores from each cleared floor earlier in this run */
  clearedScores: number[];
}

export interface FloorEvaluation {
  cleared: boolean;
  gatePassed: boolean;
  bossPassed: boolean | null;
  failReason?: "gate" | "boss";
  score: number;
  gate: number;
  baseGate: number;
  paceGate: number | null;
  bossId: BossId | null;
}

/** Floor-only minimum; steeper than the original curve */
export function getEndlessBaseGate(floor: number, boardSize: BoardSize = 5): number {
  let base: number;
  if (floor <= 1) base = 110;
  else if (floor === 2) base = 118;
  else if (floor === 3) base = 126;
  else if (floor <= 10) base = roundScore(126 + (floor - 3) * 4.5);
  else base = roundScore(157.5 + (floor - 10) * 3.5);
  return scaleGateForBoard(base, boardSize);
}

/** Gate from prior performance — keeps strong runs from coasting */
export function getEndlessPaceGate(context: EndlessGateContext): number | null {
  if (context.clearedScores.length === 0) return null;
  const avg =
    context.clearedScores.reduce((sum, s) => sum + s, 0) / context.clearedScores.length;
  const last = context.clearedScores[context.clearedScores.length - 1]!;
  return roundScore(Math.max(avg * 0.88, last * 0.82));
}

export function getEndlessGate(
  floor: number,
  context?: EndlessGateContext,
  boardSize: BoardSize = 5,
): number {
  let base = getEndlessBaseGate(floor, boardSize);
  if (isBossFloor(floor)) {
    base = roundScore(base + scaleGateForBoard(5, boardSize));
  }
  const paceGate = context ? getEndlessPaceGate(context) : null;
  if (paceGate === null) return base;
  return Math.max(base, paceGate);
}

export function getEndlessGateBreakdown(
  floor: number,
  context?: EndlessGateContext,
  boardSize: BoardSize = 5,
): { gate: number; baseGate: number; paceGate: number | null } {
  let baseGate = getEndlessBaseGate(floor, boardSize);
  if (isBossFloor(floor)) {
    baseGate = roundScore(baseGate + scaleGateForBoard(5, boardSize));
  }
  const paceGate = context ? getEndlessPaceGate(context) : null;
  const gate = paceGate === null ? baseGate : Math.max(baseGate, paceGate);
  return { gate, baseGate, paceGate };
}

export function getEffectiveGate(
  floor: number,
  gateReliefActive: boolean,
  context?: EndlessGateContext,
  boardSize: BoardSize = 5,
): number {
  const gate = getEndlessGate(floor, context, boardSize);
  const relief = gateReliefForBoard(boardSize);
  return gateReliefActive ? Math.max(0, roundScore(gate - relief)) : gate;
}

export function isBossFloor(floor: number, interval = ENDLESS_BOSS_INTERVAL): boolean {
  return floor > 0 && floor % interval === 0;
}

export function getBossIdForFloor(
  floor: number,
  interval = ENDLESS_BOSS_INTERVAL,
): BossId | null {
  if (!isBossFloor(floor, interval)) return null;
  const index = Math.floor(floor / interval) % BOSS_IDS.length;
  return BOSS_IDS[index];
}

export function getEndlessPoolK(floor: number, startingPoolK: number): number {
  if (floor <= 4) return startingPoolK;
  if (floor <= 7) return Math.max(startingPoolK - 1, 2);
  return Math.max(startingPoolK - 2, 2);
}

export function getEndlessDeckSize(
  floor: number,
  bossId: BossId | null,
  boardSize: BoardSize = 5,
): DeckSize {
  if (bossId === "sparse_deck") return boardSize === 4 ? 28 : 40;
  if (floor >= 9) return boardSize === 4 ? 36 : 45;
  if (floor >= 6) return boardSize === 4 ? 40 : 48;
  return 52;
}

export function evaluateEndlessFloor(
  score: ScoreSnapshot,
  grid: Grid,
  options: {
    floor: number;
    gateReliefActive: boolean;
    gateContext?: EndlessGateContext;
    boardSize?: BoardSize;
  },
): FloorEvaluation {
  const boardSize = options.boardSize ?? grid.size;
  const gateContext = options.gateContext;
  const { baseGate, paceGate } = getEndlessGateBreakdown(options.floor, gateContext, boardSize);
  const gate = getEffectiveGate(options.floor, options.gateReliefActive, gateContext, boardSize);
  const bossId = getBossIdForFloor(options.floor);
  const deckSize = getEndlessDeckSize(options.floor, bossId, boardSize);
  const gatePassed = score.total >= gate;

  if (!gatePassed) {
    return {
      cleared: false,
      gatePassed: false,
      bossPassed: bossId ? false : null,
      failReason: "gate",
      score: score.total,
      gate,
      baseGate,
      paceGate,
      bossId,
    };
  }

  if (bossId === null) {
    return {
      cleared: true,
      gatePassed: true,
      bossPassed: null,
      score: score.total,
      gate,
      baseGate,
      paceGate,
      bossId,
    };
  }

  const bossPassed = checkBoss(bossId, { score, grid, gate, deckSize });
  return {
    cleared: bossPassed,
    gatePassed: true,
    bossPassed,
    failReason: bossPassed ? undefined : "boss",
    score: score.total,
    gate,
    baseGate,
    paceGate,
    bossId,
  };
}

export interface EndlessBestRecord {
  maxFloor: number;
  bestTotalScore: number;
  poolK: number;
  achievedAt: string;
}

export function loadEndlessBest(): EndlessBestRecord | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(ENDLESS_LEADERBOARD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EndlessBestRecord;
  } catch {
    return null;
  }
}

export function saveEndlessBestIfBetter(
  maxFloor: number,
  totalScore: number,
  poolK: number,
): EndlessBestRecord | null {
  if (typeof localStorage === "undefined") return null;
  const existing = loadEndlessBest();
  const isBetter =
    !existing ||
    maxFloor > existing.maxFloor ||
    (maxFloor === existing.maxFloor && totalScore > existing.bestTotalScore);
  if (!isBetter) return existing;
  const record: EndlessBestRecord = {
    maxFloor,
    bestTotalScore: totalScore,
    poolK,
    achievedAt: new Date().toISOString(),
  };
  localStorage.setItem(ENDLESS_LEADERBOARD_KEY, JSON.stringify(record));
  return record;
}
