import type { CellScoreHint } from "@/engine/scoring";
import "./CardLineTooltip.css";

interface CardLineTooltipProps {
  hint: CellScoreHint;
}

export function CardLineTooltip({ hint }: CardLineTooltipProps) {
  const { lines, total, completeCount } = hint;

  return (
    <div className="card-line-tooltip" role="tooltip">
      <div className="tooltip-header">
        <span className="tooltip-total">Confirmed: {total.toFixed(1)}</span>
        <span className="tooltip-meta">
          {completeCount}/{lines.length} complete
        </span>
      </div>
      <ul className="tooltip-lines">
        {lines.map((line) => (
          <li key={line.lineId} className="tooltip-line">
            <div className="tooltip-line-title">
              <span className="tooltip-line-label">{line.label}</span>
              {line.points !== null ? (
                <span className="tooltip-line-points">{line.points.toFixed(1)}</span>
              ) : (
                <span className="tooltip-line-incomplete">{line.placed}/5</span>
              )}
            </div>
            {line.hand && (
              <>
                <div className="tooltip-hand">{line.hand}</div>
                <div className="tooltip-formula">{line.formula}</div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
