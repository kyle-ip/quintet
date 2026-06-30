import "./RotatePortraitGate.css";

export function RotatePortraitGate() {
  return (
    <div className="rotate-portrait-gate" role="dialog" aria-modal="true" aria-label="Rotate device">
      <div className="rotate-portrait-card">
        <div className="rotate-portrait-icon" aria-hidden="true">
          <span className="rotate-phone" />
          <span className="rotate-arrow">↻</span>
        </div>
        <p className="rotate-portrait-title">请旋转至横屏</p>
        <p className="rotate-portrait-sub">移动端请在横屏下游玩，以便同时看到棋盘与手牌。</p>
      </div>
    </div>
  );
}
