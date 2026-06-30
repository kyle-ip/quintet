import { useState } from "react";
import { lineDisplayName } from "@/engine/scoring";
import type { ScoreSnapshot } from "@/engine/scoring";
import { boardLineCount } from "@/engine/grid";
import { useGameStore } from "@/store/gameStore";
import "./LinesPanel.css";

interface LinesPanelProps {
  score: ScoreSnapshot;
}

export function LinesPanel({ score }: LinesPanelProps) {
  const [open, setOpen] = useState(false);
  const boardSize = useGameStore((s) => s.state.boardSize);
  const lineLen = boardSize;
  const lineCount = boardLineCount(boardSize);
  const completeCount = score.lines.filter((l) => l.complete).length;

  return (
    <div className="lines-panel">
      <button
        type="button"
        className="lines-panel-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Lines this game
        <span className="lines-panel-badge">
          {completeCount}/{lineCount}
        </span>
      </button>
      {open ? (
        <ul className="lines-panel-list">
          {score.lines.map((line) => (
            <li key={line.line} className={line.complete ? "lines-panel-complete" : ""}>
              <span className="lines-panel-name">{lineDisplayName(line.line)}</span>
              <span className="lines-panel-meta">
                {line.complete && line.hand && line.points !== null
                  ? `${line.hand} · ${line.points.toFixed(1)}`
                  : `${line.placed}/${lineLen}`}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
