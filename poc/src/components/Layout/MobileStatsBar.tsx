interface MobileStatsBarProps {
  score: number;
  turn: number;
  cellCount: number;
  deckCount: number;
  actionCount: number;
  timeLabel: string | null;
  isEndless: boolean;
  floor?: number;
  target?: number | null;
  lives?: number;
  runScore?: number;
  variant?: "bar" | "rail";
}

export function MobileStatsBar({
  score,
  turn,
  cellCount,
  deckCount,
  actionCount,
  timeLabel,
  isEndless,
  floor,
  target,
  lives,
  runScore,
  variant = "bar",
}: MobileStatsBarProps) {
  return (
    <div
      className={`mobile-stats-bar${variant === "rail" ? " mobile-stats-bar--rail" : ""}`}
      aria-label="Game stats"
    >
      <div className="mobile-stat mobile-stat-primary">
        <span className="mobile-stat-label">Score</span>
        <span className="mobile-stat-value">{score.toFixed(1)}</span>
      </div>
      {isEndless && floor !== undefined ? (
        <>
          <div className="mobile-stat">
            <span className="mobile-stat-label">Floor</span>
            <span className="mobile-stat-value">{floor}</span>
          </div>
          <div className="mobile-stat">
            <span className="mobile-stat-label">Target</span>
            <span className="mobile-stat-value">{target?.toFixed(1) ?? "—"}</span>
          </div>
          <div className="mobile-stat">
            <span className="mobile-stat-label">Lives</span>
            <span className="mobile-stat-value">{lives ?? "—"}</span>
          </div>
          <div className="mobile-stat">
            <span className="mobile-stat-label">Run</span>
            <span className="mobile-stat-value">{runScore?.toFixed(1) ?? "—"}</span>
          </div>
        </>
      ) : (
        <>
          <div className="mobile-stat">
            <span className="mobile-stat-label">Turn</span>
            <span className="mobile-stat-value">
              {turn}/{cellCount}
            </span>
          </div>
          <div className="mobile-stat">
            <span className="mobile-stat-label">Deck</span>
            <span className="mobile-stat-value">{deckCount}</span>
          </div>
        </>
      )}
      <div className="mobile-stat">
        <span className="mobile-stat-label">Acts</span>
        <span className="mobile-stat-value">{actionCount}</span>
      </div>
      {timeLabel ? (
        <div className="mobile-stat">
          <span className="mobile-stat-label">Time</span>
          <span className="mobile-stat-value">{timeLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
