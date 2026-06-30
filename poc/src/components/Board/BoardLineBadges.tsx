import type { CSSProperties } from "react";
import type { LineHighlight } from "@/engine/lineHighlights";
import { handCategoryCssVar } from "@/engine/lineHighlights";
import "./BoardLineBadges.css";

interface LineHandBadgeProps {
  line: LineHighlight;
}

export function LineHandBadge({ line }: LineHandBadgeProps) {
  return (
    <span
      className={`line-hand-badge line-hand-badge-${line.kind}${
        line.complete ? " line-hand-badge-complete" : ""
      }`}
      style={{ "--badge-color": handCategoryCssVar(line.category) } as CSSProperties}
      title={`${line.label}: ${line.handLabel}${line.complete ? "" : " (forming)"}`}
    >
      {line.shortLabel}
    </span>
  );
}

interface LineHandBadgeStackProps {
  lines: LineHighlight[];
}

export function LineHandBadgeStack({ lines }: LineHandBadgeStackProps) {
  if (lines.length === 0) return null;

  return (
    <div className="line-hand-badge-stack" aria-label="Formed poker hands on lines">
      {lines.map((line) => (
        <LineHandBadge key={line.lineId} line={line} />
      ))}
    </div>
  );
}
