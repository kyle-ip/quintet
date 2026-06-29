import type { Card } from "@/engine/card";

export interface DealFlight {
  id: string;
  card: Card;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  height: number;
  delayMs: number;
}

export interface PoolDealFxState {
  hiddenIndices: Set<number>;
  dealtIndices: Set<number>;
  flights: DealFlight[];
  deckDrawing: boolean;
}

export const REDUCED_MOTION =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEAL_DURATION_MS = 480;
const DEAL_STAGGER_MS = 70;

function isRefillDeal(
  prevPoolLen: number,
  prevDeckLen: number,
  poolLen: number,
  deckLen: number,
): boolean {
  const added = poolLen - prevPoolLen;
  const drawn = prevDeckLen - deckLen;
  return added > 0 && drawn > 0 && added === drawn;
}

export function detectDeal(
  prevPoolLen: number,
  prevDeckLen: number,
  poolLen: number,
  deckLen: number,
): { startIndex: number; count: number } | null {
  if (!isRefillDeal(prevPoolLen, prevDeckLen, poolLen, deckLen)) {
    return null;
  }
  return { startIndex: prevPoolLen, count: poolLen - prevPoolLen };
}

export function buildDealFlights(
  cards: Card[],
  startIndex: number,
  deckRect: DOMRect,
  slotElements: (HTMLElement | null)[],
): DealFlight[] {
  const flights: DealFlight[] = [];
  const fromX = deckRect.left + deckRect.width / 2;
  const fromY = deckRect.top + deckRect.height * 0.38;

  cards.forEach((card, i) => {
    const slot = slotElements[startIndex + i];
    if (!slot) return;
    const slotRect = slot.getBoundingClientRect();
    flights.push({
      id: `deal-${startIndex + i}-${card.rank}${card.suit}-${Date.now()}-${i}`,
      card,
      fromX,
      fromY,
      toX: slotRect.left + slotRect.width / 2,
      toY: slotRect.top + slotRect.height / 2,
      width: slotRect.width,
      height: slotRect.height,
      delayMs: i * DEAL_STAGGER_MS,
    });
  });

  return flights;
}

export function dealAnimationTotalMs(flightCount: number): number {
  if (flightCount === 0) return 0;
  return DEAL_DURATION_MS + (flightCount - 1) * DEAL_STAGGER_MS + 40;
}
