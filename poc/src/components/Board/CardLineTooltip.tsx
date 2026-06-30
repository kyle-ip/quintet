import type { CellScoreHint } from "@/engine/scoring";
import "./CardLineTooltip.css";

interface CardLineTooltipProps {
  hint: CellScoreHint;
}

export function CardLineTooltip({ hint }: CardLineTooltipProps) {
  const formedLines = hint.lines.filter((line) => line.hand && line.hand !== "High Card");
  const { total, completeCount } = hint;

  if (formedLines.length === 0) {
    return (
      <div className="card-line-tooltip" role="tooltip">
        <p className="tooltip-empty">No formed hands on lines through this card yet.</p>
      </div>
    );
  }

  return (
    <div className="card-line-tooltip" role="tooltip">
      <div className="tooltip-header">
        <span className="tooltip-total">Confirmed: {total.toFixed(1)}</span>
        <span className="tooltip-meta">
          {completeCount} scored · {formedLines.length} formed
        </span>
      </div>
      <ul className="tooltip-lines">
        {formedLines.map((line) => (
          <li
            key={line.lineId}
            className={`tooltip-line${line.complete ? " tooltip-line-complete" : " tooltip-line-forming"}`}
          >
            <div className="tooltip-line-title">
              <span className="tooltip-line-label">{line.label}</span>
              {line.complete && line.points !== null ? (
                <span className="tooltip-line-points">{line.points.toFixed(1)}</span>
              ) : (
                <span className="tooltip-line-incomplete">{line.placed} cards</span>
              )}
            </div>
            {line.hand ? (
              <>
                <div className="tooltip-hand">
                  {line.hand}
                  {!line.complete ? <span className="tooltip-formed"> · forming</span> : null}
                </div>
                {line.formula ? <div className="tooltip-formula">{line.formula}</div> : null}
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
