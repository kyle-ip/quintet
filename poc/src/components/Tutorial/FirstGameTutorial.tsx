import { AppModal } from "@/components/Modal/AppModal";
import "./FirstGameTutorial.css";

const STORAGE_KEY = "quintet-tutorial-seen";

const STEPS = [
  {
    title: "Place cards on the grid",
    body: "Drag a card from the pool onto the 5×5 board. Your first card can go anywhere.",
  },
  {
    title: "Eight-direction adjacency",
    body: "After the first card, each new card must touch an existing card — including diagonally (8 directions).",
  },
  {
    title: "Score 12 lines",
    body: "When a full row, column, or diagonal (5/5) is complete, it scores once using v4 poker hand values. Fill all 25 cells to finish.",
  },
] as const;

export interface FirstGameTutorialProps {
  open: boolean;
  onClose: () => void;
}

export function FirstGameTutorial({ open, onClose }: FirstGameTutorialProps) {
  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }

  return (
    <AppModal
      open={open}
      onClose={finish}
      title="How to play"
      titleId="tutorial-title"
      className="tutorial-modal"
      footer={
        <div className="tutorial-footer">
          <button type="button" className="tutorial-skip" onClick={finish}>
            Got it
          </button>
        </div>
      }
    >
      <ol className="tutorial-steps">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <strong>
              {i + 1}. {step.title}
            </strong>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </AppModal>
  );
}

export function shouldShowTutorial(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}
