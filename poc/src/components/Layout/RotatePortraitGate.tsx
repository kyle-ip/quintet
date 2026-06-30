import "./RotatePortraitGate.css";

export function RotatePortraitGate() {
  return (
    <div className="rotate-portrait-gate" role="dialog" aria-modal="true" aria-label="Rotate device">
      <div className="rotate-portrait-card">
        <div className="rotate-portrait-icon" aria-hidden="true">
          <span className="rotate-phone" />
          <span className="rotate-arrow">↻</span>
        </div>
        <p className="rotate-portrait-title">Rotate to landscape</p>
        <p className="rotate-portrait-sub">
          Play in landscape to see the board and your card pool at once.
        </p>
      </div>
    </div>
  );
}
