import { describe, expect, it } from "vitest";
import { HandCategory } from "@/engine/hand";
import { evaluateFive } from "@/engine/hand";
import { parseCard } from "@/engine/card";
import { scoreV4 } from "@/engine/scoring";
import { buildScoringExample, SCORING_RULES_V4 } from "@/config/scoringRules";

describe("scoring rules examples", () => {
  it("each example matches the engine score", () => {
    for (const rule of SCORING_RULES_V4) {
      const cards = rule.exampleCards.map(parseCard);
      const hand = evaluateFive(cards);
      const points = scoreV4(hand);
      const example = buildScoringExample(rule.exampleCards);
      expect(example.points).toBe(Math.round(points * 10) / 10);
      expect(example.calculation).toContain(example.points.toFixed(1));
    }
  });

  it("covers every scored hand category", () => {
    const categories = new Set(
      SCORING_RULES_V4.map((rule) => evaluateFive(rule.exampleCards.map(parseCard)).category),
    );
    expect(categories).toEqual(
      new Set([
        HandCategory.RoyalFlush,
        HandCategory.StraightFlush,
        HandCategory.FourOfAKind,
        HandCategory.FullHouse,
        HandCategory.Flush,
        HandCategory.Straight,
        HandCategory.ThreeOfAKind,
        HandCategory.TwoPair,
        HandCategory.OnePair,
        HandCategory.HighCard,
      ]),
    );
  });
});
