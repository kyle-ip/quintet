/** Format milliseconds as m:ss.t (t = tenths). */
export function formatElapsedMs(ms: number): string {
  const clamped = Math.max(0, Math.round(ms));
  const tenths = Math.floor((clamped % 1000) / 100);
  const totalSec = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const secPad = seconds.toString().padStart(2, "0");
  if (minutes > 0) {
    return `${minutes}:${secPad}.${tenths}`;
  }
  return `${seconds}.${tenths}s`;
}
