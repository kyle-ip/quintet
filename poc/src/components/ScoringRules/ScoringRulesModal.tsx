import { AppModal } from "@/components/Modal/AppModal";
import { SCORING_RULES_FOOTNOTES, scoringRulesWithExamples } from "@/config/scoringRules";
import "./ScoringRulesModal.css";

interface ScoringRulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function ScoringRulesModal({ open, onClose }: ScoringRulesModalProps) {
  const rules = scoringRulesWithExamples();

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Scoring rules (v4)"
      titleId="scoring-rules-title"
      className="scoring-rules-modal"
    >
      <p className="scoring-rules-intro">
        Standard 5-card poker hands on each line. Points use rank values in the formulas below.
      </p>

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
    </AppModal>
  );
}
