import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  buildDealFlights,
  dealAnimationTotalMs,
  type DealFlight,
} from "./poolDealFx";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePoolDealFx() {
  const pool = useGameStore((s) => s.state.pool);
  const dealSignal = useGameStore((s) => s.dealSignal);
  const lastDealStartIndex = useGameStore((s) => s.lastDealStartIndex);
  const lastDealCount = useGameStore((s) => s.lastDealCount);

  const deckRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastProcessedSignal = useRef(0);

  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(() => new Set());
  const [dealtIndices, setDealtIndices] = useState<Set<number>>(() => new Set());
  const [flights, setFlights] = useState<DealFlight[]>([]);
  const [deckDrawing, setDeckDrawing] = useState(false);

  const registerSlot = useCallback((index: number, el: HTMLDivElement | null) => {
    slotRefs.current[index] = el;
  }, []);

  const finishDeal = useCallback((indices: number[]) => {
    setFlights([]);
    setHiddenIndices(new Set());
    setDealtIndices(new Set(indices));
    setDeckDrawing(false);
    window.setTimeout(() => setDealtIndices(new Set()), 520);
  }, []);

  useLayoutEffect(() => {
    if (dealSignal === 0 || dealSignal === lastProcessedSignal.current || lastDealCount === 0) {
      return;
    }
    lastProcessedSignal.current = dealSignal;

    const indices = Array.from({ length: lastDealCount }, (_, i) => lastDealStartIndex + i);
    const cards = pool.slice(lastDealStartIndex, lastDealStartIndex + lastDealCount);

    if (prefersReducedMotion()) {
      setDealtIndices(new Set(indices));
      window.setTimeout(() => setDealtIndices(new Set()), 320);
      return;
    }

    setHiddenIndices(new Set(indices));
    setDeckDrawing(true);

    const deckEl = deckRef.current;
    if (!deckEl) {
      finishDeal(indices);
      return;
    }

    const built = buildDealFlights(
      cards,
      lastDealStartIndex,
      deckEl.getBoundingClientRect(),
      slotRefs.current,
    );

    if (built.length === 0) {
      finishDeal(indices);
      return;
    }

    setFlights(built);
    const timer = window.setTimeout(() => finishDeal(indices), dealAnimationTotalMs(built.length));
    return () => window.clearTimeout(timer);
  }, [dealSignal, lastDealStartIndex, lastDealCount, pool, finishDeal]);

  return {
    deckRef,
    registerSlot,
    hiddenIndices,
    dealtIndices,
    flights,
    deckDrawing,
  };
}
