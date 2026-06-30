import type { CSSProperties } from "react";
import type { CellAccents } from "@/engine/lineHighlights";
import { handCategoryCssVar } from "@/engine/lineHighlights";
import "./BoardLineAccents.css";

interface BoardLineAccentsProps {
  accents: CellAccents | undefined;
}

export function BoardLineAccents({ accents }: BoardLineAccentsProps) {
  if (!accents) return null;

  return (
    <div className="board-line-accents" aria-hidden="true">
      {accents.row ? (
        <span
          className={`line-accent line-accent-row${accents.row.complete ? " line-accent-complete" : ""}`}
          style={
            { "--line-accent-color": handCategoryCssVar(accents.row.category) } as CSSProperties
          }
        />
      ) : null}
      {accents.col ? (
        <span
          className={`line-accent line-accent-col${accents.col.complete ? " line-accent-complete" : ""}`}
          style={
            { "--line-accent-color": handCategoryCssVar(accents.col.category) } as CSSProperties
          }
        />
      ) : null}
      {accents.diagMain ? (
        <span
          className={`line-accent line-accent-diag line-accent-diag-main${
            accents.diagMain.complete ? " line-accent-complete" : ""
          }`}
          style={
            { "--line-accent-color": handCategoryCssVar(accents.diagMain.category) } as CSSProperties
          }
        />
      ) : null}
      {accents.diagAnti ? (
        <span
          className={`line-accent line-accent-diag line-accent-diag-anti${
            accents.diagAnti.complete ? " line-accent-complete" : ""
          }`}
          style={
            { "--line-accent-color": handCategoryCssVar(accents.diagAnti.category) } as CSSProperties
          }
        />
      ) : null}
    </div>
  );
}
