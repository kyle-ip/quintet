import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { formatElapsedMs } from "@/utils/formatElapsed";

export function usePlayTimerDisplay(): string | null {
  const timerStartAt = useGameStore((s) => s.timerStartAt);
  const timerStoppedAt = useGameStore((s) => s.timerStoppedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (timerStartAt === null || timerStoppedAt !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [timerStartAt, timerStoppedAt]);

  if (timerStartAt === null) return null;
  const end = timerStoppedAt ?? now;
  return formatElapsedMs(end - timerStartAt);
}

export function useElapsedMs(): number | null {
  const timerStartAt = useGameStore((s) => s.timerStartAt);
  const timerStoppedAt = useGameStore((s) => s.timerStoppedAt);
  if (timerStartAt === null) return null;
  if (timerStoppedAt !== null) return timerStoppedAt - timerStartAt;
  return null;
}
