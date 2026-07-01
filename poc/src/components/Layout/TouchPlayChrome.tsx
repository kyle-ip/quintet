import { MobileStatsBar } from "./MobileStatsBar";

interface TouchPlaySideTopProps {
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
  settingsOpen: boolean;
  onSettingsToggle: () => void;
}

export function TouchPlaySideTop({
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
  settingsOpen,
  onSettingsToggle,
}: TouchPlaySideTopProps) {
  return (
    <div className="play-side-top">
      <div className="play-side-top-head">
        <span className="play-side-brand">Quintet</span>
        <button
          type="button"
          className="btn-settings-mobile"
          aria-label="Settings"
          aria-expanded={settingsOpen}
          onClick={onSettingsToggle}
        >
          ⚙
        </button>
      </div>
      <MobileStatsBar
        variant="rail"
        score={score}
        turn={turn}
        cellCount={cellCount}
        deckCount={deckCount}
        actionCount={actionCount}
        timeLabel={timeLabel}
        isEndless={isEndless}
        floor={floor}
        target={target}
        lives={lives}
        runScore={runScore}
      />
    </div>
  );
}

interface TouchPlaySideBottomProps {
  undoLabel: string;
  canUndo: boolean;
  undoTitle: string;
  onUndo: () => void;
  onNewGame: () => void;
}

export function TouchPlaySideBottom({
  undoLabel,
  canUndo,
  undoTitle,
  onUndo,
  onNewGame,
}: TouchPlaySideBottomProps) {
  return (
    <div className="play-side-bottom">
      <button type="button" onClick={onUndo} disabled={!canUndo} title={undoTitle}>
        {undoLabel}
      </button>
      <button type="button" className="btn-new-game" onClick={onNewGame}>
        New game
      </button>
    </div>
  );
}
