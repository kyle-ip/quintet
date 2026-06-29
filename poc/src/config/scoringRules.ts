/** v4 scoring formulas — keep in sync with `scoreV4` in engine/scoring.ts */
import { cardLabel, parseCard } from "@/engine/card";
import { evaluateFive, HandCategory } from "@/engine/hand";
import { roundScore, scoreV4 } from "@/engine/scoring";

export interface ScoringRule {
  hand: string;
  formula: string;
  exampleCards: string[];
}

export interface ScoringRuleExample {
  cards: string;
  calculation: string;
  points: number;
}

export const SCORING_RULES_V4: ScoringRule[] = [
  { hand: "Royal Flush", formula: "200", exampleCards: ["Ah", "Kh", "Qh", "Jh", "10h"] },
  { hand: "Straight Flush", formula: "165 + high × 0.1", exampleCards: ["9s", "8s", "7s", "6s", "5s"] },
  { hand: "Four of a Kind", formula: "130 + quad × 0.5 + kicker × 0.1", exampleCards: ["Kc", "Kd", "Kh", "Ks", "3c"] },
  { hand: "Full House", formula: "98 + trips × 0.2 + pair × 0.1", exampleCards: ["Qh", "Qd", "Qs", "7c", "7d"] },
  { hand: "Flush", formula: "78 + sum(ranks) × 0.05", exampleCards: ["Ad", "Jd", "8d", "5d", "2d"] },
  { hand: "Straight", formula: "62 + high × 0.1", exampleCards: ["9c", "8h", "7d", "6s", "5c"] },
  {
    hand: "Three of a Kind",
    formula: "24 + trips × 0.2 + sum(kickers) × 0.05",
    exampleCards: ["10h", "10d", "10s", "4c", "2h"],
  },
  {
    hand: "Two Pair",
    formula: "16 + high pair × 0.1 + low pair × 0.1 + kicker × 0.05",
    exampleCards: ["Js", "Jd", "8h", "8c", "3s"],
  },
  {
    hand: "One Pair",
    formula: "9 + pair × 0.1 + sum(kickers) × 0.05",
    exampleCards: ["Ah", "Ad", "9c", "6h", "2s"],
  },
  {
    hand: "High Card",
    formula: "4 + high × 0.1 + sum(2nd & 3rd) × 0.05",
    exampleCards: ["Ah", "Qd", "9c", "6h", "3s"],
  },
];

/** @deprecated Historical v3 rules — formulas differ from v4 */
export const SCORING_RULES_V3: ScoringRule[] = [
  { hand: "Royal Flush", formula: "100", exampleCards: ["Ah", "Kh", "Qh", "Jh", "10h"] },
  { hand: "Straight Flush", formula: "92 + high × 0.1", exampleCards: ["9s", "8s", "7s", "6s", "5s"] },
  { hand: "Four of a Kind", formula: "78 + quad × 0.5 + kicker × 0.1", exampleCards: ["Kc", "Kd", "Kh", "Ks", "3c"] },
  { hand: "Full House", formula: "62 + trips × 0.2 + pair × 0.1", exampleCards: ["Qh", "Qd", "Qs", "7c", "7d"] },
  { hand: "Flush", formula: "52 + sum(ranks) × 0.05", exampleCards: ["Ad", "Jd", "8d", "5d", "2d"] },
  { hand: "Straight", formula: "45 + high × 0.1", exampleCards: ["9c", "8h", "7d", "6s", "5c"] },
  {
    hand: "Three of a Kind",
    formula: "28 + trips × 0.2 + sum(kickers) × 0.05",
    exampleCards: ["10h", "10d", "10s", "4c", "2h"],
  },
  {
    hand: "Two Pair",
    formula: "18 + high pair × 0.1 + low pair × 0.1 + kicker × 0.05",
    exampleCards: ["Js", "Jd", "8h", "8c", "3s"],
  },
  {
    hand: "One Pair",
    formula: "10 + pair × 0.1 + sum(kickers) × 0.05",
    exampleCards: ["Ah", "Ad", "9c", "6h", "2s"],
  },
  {
    hand: "High Card",
    formula: "5 + high × 0.1 + sum(2nd & 3rd) × 0.05",
    exampleCards: ["Ah", "Qd", "9c", "6h", "3s"],
  },
];

/** @deprecated Use SCORING_RULES_V4 */
export const SCORING_RULES_V2 = SCORING_RULES_V4;

export const SCORING_RULES_FOOTNOTES = [
  "Rank points: 2–10 face value, J=11, Q=12, K=13, A=14.",
  "Each complete row, column, or diagonal (5/5) scores once; 12 lines per game.",
  "Only full lines count toward the total score.",
  "Base points follow hand rarity; rank bonuses use at most one decimal place.",
];

function formatCalculation(hand: ReturnType<typeof evaluateFive>, points: number): string {
  const r = hand.ranks;
  const pts = roundScore(points);

  switch (hand.category) {
    case HandCategory.RoyalFlush:
      return `= ${pts.toFixed(1)}`;
    case HandCategory.StraightFlush:
      return `= 165 + ${r[0]} × 0.1 = ${pts.toFixed(1)}`;
    case HandCategory.FourOfAKind:
      return `= 130 + ${r[0]} × 0.5 + ${r[1]} × 0.1 = ${pts.toFixed(1)}`;
    case HandCategory.FullHouse:
      return `= 98 + ${r[0]} × 0.2 + ${r[1]} × 0.1 = ${pts.toFixed(1)}`;
    case HandCategory.Flush: {
      const sum = r.reduce((a, b) => a + b, 0);
      return `= 78 + ${sum} × 0.05 = ${pts.toFixed(1)}`;
    }
    case HandCategory.Straight:
      return `= 62 + ${r[0]} × 0.1 = ${pts.toFixed(1)}`;
    case HandCategory.ThreeOfAKind: {
      const kickers = r.slice(1).reduce((a, b) => a + b, 0);
      return `= 24 + ${r[0]} × 0.2 + ${kickers} × 0.05 = ${pts.toFixed(1)}`;
    }
    case HandCategory.TwoPair:
      return `= 16 + ${r[0]} × 0.1 + ${r[1]} × 0.1 + ${r[2]} × 0.05 = ${pts.toFixed(1)}`;
    case HandCategory.OnePair: {
      const kickers = r.slice(1).reduce((a, b) => a + b, 0);
      return `= 9 + ${r[0]} × 0.1 + ${kickers} × 0.05 = ${pts.toFixed(1)}`;
    }
    case HandCategory.HighCard: {
      const topThree = r.slice(1, 3).reduce((a, b) => a + b, 0);
      return `= 4 + ${r[0]} × 0.1 + ${topThree} × 0.05 = ${pts.toFixed(1)}`;
    }
    default:
      return `= ${pts.toFixed(1)}`;
  }
}

export function buildScoringExample(cardIds: string[]): ScoringRuleExample {
  const cards = cardIds.map(parseCard);
  const hand = evaluateFive(cards);
  const points = roundScore(scoreV4(hand));
  return {
    cards: cards.map(cardLabel).join(" "),
    calculation: formatCalculation(hand, points),
    points,
  };
}

export function scoringRulesWithExamples(): Array<ScoringRule & ScoringRuleExample> {
  return SCORING_RULES_V4.map((rule) => ({
    ...rule,
    ...buildScoringExample(rule.exampleCards),
  }));
}
