import type { CSSProperties } from "react";
import "./CardBack.css";

interface CardBackProps {
  className?: string;
  style?: CSSProperties;
}

/** Face-down card back for deck stack visuals */
export function CardBack({ className, style }: CardBackProps) {
  return (
    <div
      className={["card-back", className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    >
      <div className="card-back-inner">
        <span className="card-back-mark">Q</span>
      </div>
    </div>
  );
}
