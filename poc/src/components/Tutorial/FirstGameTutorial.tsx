import { AppModal } from "@/components/Modal/AppModal";
import { SCORING_RULES_FOOTNOTES, scoringRulesWithExamples } from "@/config/scoringRules";
import "./FirstGameTutorial.css";
import "../ScoringRules/ScoringRulesModal.css";

const STORAGE_KEY = "quintet-tutorial-seen";

const STEPS = [
  {
    title: "Place cards on the grid",
    body: "Drag a card from the pool onto the board (4×4 or 5×5). Your first card can go anywhere.",
  },
  {
    title: "Eight-direction adjacency",
    body: "After the first card, each new card must touch an existing card — including diagonally (8 directions).",
  },
  {
    title: "Score every line",
    body: "When a full row, column, or diagonal is complete, it scores once using v4 poker hand values. Fill every cell to finish the board.",
  },
] as const;

export interface FirstGameTutorialProps {
  open: boolean;
  onClose: () => void;
}

export function FirstGameTutorial({ open, onClose }: FirstGameTutorialProps) {
  const rules = scoringRulesWithExamples();

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
      className="tutorial-modal scoring-rules-modal"
      footer={
        <div className="tutorial-footer">
          <button type="button" className="tutorial-skip" onClick={finish}>
            Got it
          </button>
        </div>
      }
    >
      <section aria-labelledby="tutorial-how-heading">
        <ol className="tutorial-steps">
          {STEPS.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <br />

      <section aria-labelledby="tutorial-scoring-heading">
        <table className="scoring-rules-table">
          <thead>
            <tr>
              <th scope="col">Hand</th>
              <th scope="col">Points</th>
              <th scope="col">Example</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.hand}>
                <td>{rule.hand}</td>
                <td>
                  <code>{rule.formula}</code>
                </td>
                <td className="scoring-rules-example">
                  <span className="scoring-rules-cards">{rule.cards}</span>
                  <code className="scoring-rules-calc">{rule.calculation}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="scoring-rules-footnotes">
          {SCORING_RULES_FOOTNOTES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </AppModal>
  );
}

export function shouldShowTutorial(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}
