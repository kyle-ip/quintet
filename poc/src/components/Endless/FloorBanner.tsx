import { BOSS_DEFINITIONS, type BossId } from "@/engine/bosses";
import "./FloorBanner.css";

interface FloorBannerProps {
  floor: number;
  target: number;
  baseTarget: number;
  paceTarget: number | null;
  lives: number;
  maxLives: number;
  deckSize: number;
  poolK: number;
  bossId: BossId | null;
  runScore: number;
  gateReliefActive: boolean;
  onDismiss: () => void;
}

function renderLives(lives: number, maxLives: number): string {
  return "♥".repeat(lives) + "♡".repeat(Math.max(0, maxLives - lives));
}

export function FloorBanner({
  floor,
  target,
  baseTarget,
  paceTarget,
  lives,
  maxLives,
  deckSize,
  poolK,
  bossId,
  runScore,
  gateReliefActive,
  onDismiss,
}: FloorBannerProps) {
  const boss = bossId ? BOSS_DEFINITIONS[bossId] : null;

  return (
    <div className="floor-banner" role="status" aria-live="polite">
      <div className="floor-banner-content">
        <span className="floor-banner-title">Floor {floor}</span>
        <span className="floor-banner-sep">·</span>
        <span>
          Target: <strong>{target.toFixed(1)}</strong>
          {gateReliefActive ? " (relief)" : ""}
          {paceTarget !== null && paceTarget > baseTarget ? " · pace" : ""}
        </span>
        <span className="floor-banner-sep">·</span>
        <span aria-label={`${lives} of ${maxLives} lives`}>{renderLives(lives, maxLives)}</span>
        <span className="floor-banner-sep">·</span>
        <span>Run: {runScore.toFixed(1)}</span>
        {paceTarget !== null && paceTarget > baseTarget ? (
          <span className="floor-banner-meta">
            Floor minimum {baseTarget.toFixed(1)} · Your run pace requires {paceTarget.toFixed(1)}+
          </span>
        ) : null}
        <span className="floor-banner-meta">
          Deck {deckSize} · Pool k {poolK}
        </span>
        {boss ? (
          <span className="floor-banner-boss">
            Boss: {boss.name} — {boss.description}
          </span>
        ) : null}
      </div>
      <button type="button" className="floor-banner-dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
