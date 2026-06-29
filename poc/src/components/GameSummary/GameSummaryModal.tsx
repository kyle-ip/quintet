import { AppModal } from "@/components/Modal/AppModal";
import type { LineScore, ScoreSnapshot } from "@/engine/scoring";
import { formatElapsedMs } from "@/utils/formatElapsed";
import "./GameSummaryModal.css";

interface GameSummaryModalProps {
  open: boolean;
  score: ScoreSnapshot;
  actionCount: number;
  elapsedMs: number | null;
  onClose: () => void;
  onNewGame: () => void;
}

function formatLineLabel(lineId: string): string {
  if (lineId.startsWith("row_")) {
    return `Row ${Number(lineId.replace("row_", "")) + 1}`;
  }
  if (lineId.startsWith("col_")) {
    return `Col ${Number(lineId.replace("col_", "")) + 1}`;
  }
  if (lineId === "diag_main") return "Diagonal ↘";
  if (lineId === "diag_anti") return "Diagonal ↙";
  return lineId;
}

function groupLines(lines: LineScore[]) {
  const rows = lines.filter((l) => l.line.startsWith("row_"));
  const cols = lines.filter((l) => l.line.startsWith("col_"));
  const diags = lines.filter((l) => l.line.startsWith("diag_"));
  return { rows, cols, diags };
}

function bestHand(lines: LineScore[]): { hand: string; points: number } | null {
  let best: { hand: string; points: number } | null = null;
  for (const line of lines) {
    if (!line.hand || line.points == null) continue;
    if (!best || line.points > best.points) {
      best = { hand: line.hand, points: line.points };
    }
  }
  return best;
}

export function GameSummaryModal({
  open,
  score,
  actionCount,
  elapsedMs,
  onClose,
  onNewGame,
}: GameSummaryModalProps) {
  const completeLines = score.lines.filter((l) => l.complete);
  const { rows, cols, diags } = groupLines(score.lines);
  const top = bestHand(score.lines);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Game complete"
      titleId="game-summary-title"
      className="game-summary-modal"
      footer={
        <>
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={onNewGame}>
            New game
          </button>
        </>
      }
    >
      <div className="game-summary-hero">
        <span className="game-summary-label">Final score</span>
        <span className="game-summary-total">{score.total.toFixed(1)}</span>
      </div>

      <dl className="game-summary-stats">
        <div>
          <dt>Lines scored</dt>
          <dd>{completeLines.length}/12</dd>
        </div>
        <div>
          <dt>Actions</dt>
          <dd>{actionCount}</dd>
        </div>
        {top ? (
          <div className="game-summary-stat">
            <dt>Best line</dt>
            <dd>
              {top.hand} <span className="game-summary-points">({top.points.toFixed(1)} pts)</span>
            </dd>
          </div>
        ) : null}
        {elapsedMs !== null ? (
          <div className="game-summary-stat">
            <dt>Time</dt>
            <dd>{formatElapsedMs(elapsedMs)}</dd>
          </div>
        ) : null}
      </dl>

      <section className="game-summary-section">
        <h3>Rows</h3>
        <table className="game-summary-table">
          <thead>
            <tr>
              <th scope="col">Line</th>
              <th scope="col">Hand</th>
              <th scope="col">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((line) => (
              <tr key={line.line}>
                <td>{formatLineLabel(line.line)}</td>
                <td>{line.hand ?? "—"}</td>
                <td>{line.points != null ? line.points.toFixed(1) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="game-summary-section">
        <h3>Columns</h3>
        <table className="game-summary-table">
          <thead>
            <tr>
              <th scope="col">Line</th>
              <th scope="col">Hand</th>
              <th scope="col">Pts</th>
            </tr>
          </thead>
          <tbody>
            {cols.map((line) => (
              <tr key={line.line}>
                <td>{formatLineLabel(line.line)}</td>
                <td>{line.hand ?? "—"}</td>
                <td>{line.points != null ? line.points.toFixed(1) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="game-summary-section">
        <h3>Diagonals</h3>
        <table className="game-summary-table">
          <thead>
            <tr>
              <th scope="col">Line</th>
              <th scope="col">Hand</th>
              <th scope="col">Pts</th>
            </tr>
          </thead>
          <tbody>
            {diags.map((line) => (
              <tr key={line.line}>
                <td>{formatLineLabel(line.line)}</td>
                <td>{line.hand ?? "—"}</td>
                <td>{line.points != null ? line.points.toFixed(1) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppModal>
  );
}
