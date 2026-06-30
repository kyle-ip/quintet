import { AppModal } from "@/components/Modal/AppModal";
import { BOSS_DEFINITIONS, type BossId } from "@/engine/bosses";
import type { FloorEvaluation } from "@/engine/run";
import "./FloorResultModal.css";

interface FloorResultModalProps {
  open: boolean;
  floor: number;
  result: FloorEvaluation;
  lives: number;
  maxLives: number;
  gateReliefAvailable: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onRetryWithRelief: () => void;
  onEndRun: () => void;
  onClose: () => void;
}

function renderLives(lives: number, maxLives: number): string {
  return "♥".repeat(lives) + "♡".repeat(Math.max(0, maxLives - lives));
}

function failMessage(result: FloorEvaluation): string {
  if (result.failReason === "boss" && result.bossId) {
    const boss = BOSS_DEFINITIONS[result.bossId as BossId];
    return `Boss failed: ${boss.name}`;
  }
  return "Score below floor target";
}

export function FloorResultModal({
  open,
  floor,
  result,
  lives,
  maxLives,
  gateReliefAvailable,
  onContinue,
  onRetry,
  onRetryWithRelief,
  onEndRun,
  onClose,
}: FloorResultModalProps) {
  const cleared = result.cleared;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={cleared ? `Floor ${floor} cleared` : `Floor ${floor} failed`}
      titleId="floor-result-title"
      className="floor-result-modal"
      footer={
        cleared ? (
          <>
            <button type="button" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={onContinue}>
              Continue to floor {floor + 1}
            </button>
          </>
        ) : lives > 0 ? (
          <>
            <button type="button" onClick={onEndRun}>
              End run
            </button>
            {gateReliefAvailable ? (
              <button type="button" onClick={onRetryWithRelief}>
                Retry (−10 target)
              </button>
            ) : null}
            <button type="button" className="btn-primary" onClick={onRetry}>
              Retry floor
            </button>
          </>
        ) : (
          <button type="button" className="btn-primary" onClick={onEndRun}>
            View run summary
          </button>
        )
      }
    >
      <div className={`floor-result-hero${cleared ? " floor-result-hero--clear" : " floor-result-hero--fail"}`}>
        <span className="floor-result-score">
          {result.score.toFixed(1)} / {result.gate.toFixed(1)}
        </span>
        {cleared ? (
          <span className="floor-result-delta">+{(result.score - result.gate).toFixed(1)} over target</span>
        ) : (
          <span className="floor-result-delta">{failMessage(result)}</span>
        )}
      </div>

      {!cleared && lives > 0 ? (
        <p className="floor-result-lives">
          −1 life · {renderLives(lives, maxLives)} remaining
        </p>
      ) : null}

      {result.bossId && cleared ? (
        <p className="floor-result-boss">Boss cleared: {BOSS_DEFINITIONS[result.bossId].name}</p>
      ) : null}
    </AppModal>
  );
}
