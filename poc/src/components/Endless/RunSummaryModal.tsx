import { AppModal } from "@/components/Modal/AppModal";
import { loadEndlessBest, type EndlessBestRecord } from "@/engine/run";
import "./RunSummaryModal.css";

interface RunSummaryModalProps {
  open: boolean;
  maxFloorCleared: number;
  totalScore: number;
  startingPoolK: number;
  onNewRun: () => void;
  onClassicMode: () => void;
  onClose: () => void;
}

export function RunSummaryModal({
  open,
  maxFloorCleared,
  totalScore,
  startingPoolK,
  onNewRun,
  onClassicMode,
  onClose,
}: RunSummaryModalProps) {
  const best: EndlessBestRecord | null = loadEndlessBest();
  const isNewBest =
    best !== null &&
    (maxFloorCleared > best.maxFloor ||
      (maxFloorCleared === best.maxFloor && totalScore > best.bestTotalScore));

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Endless run over"
      titleId="run-summary-title"
      className="run-summary-modal"
      footer={
        <>
          <button type="button" onClick={onClassicMode}>
            Classic mode
          </button>
          <button type="button" className="btn-primary" onClick={onNewRun}>
            New run
          </button>
        </>
      }
    >
      <dl className="run-summary-stats">
        <div>
          <dt>Highest floor cleared</dt>
          <dd>{maxFloorCleared}</dd>
        </div>
        <div>
          <dt>Run total score</dt>
          <dd>{totalScore.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Starting pool k</dt>
          <dd>{startingPoolK}</dd>
        </div>
      </dl>

      {best ? (
        <section className="run-summary-best">
          <h3>Local best</h3>
          <p>
            Floor {best.maxFloor} · {best.bestTotalScore.toFixed(1)} pts · pool k {best.poolK}
          </p>
          {isNewBest ? <p className="run-summary-new-best">New personal best!</p> : null}
        </section>
      ) : null}
    </AppModal>
  );
}
