"""Hand scoring formulas (v1 draft and v2 calibrated)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from quintet.hand import HandCategory, HandResult


def round_score(value: float) -> float:
    """One decimal place, half-up — keep in sync with TS `roundScore`."""
    import math

    return math.floor(value * 10 + 0.5 + 1e-9) / 10


@dataclass(frozen=True, slots=True)
class ScoringRule:
    name: str
    score_fn: Callable[[HandResult], float]

    def score(self, hand: HandResult) -> float:
        return self.score_fn(hand)




# --- v1: original draft from prompt.md ---


def score_v1(hand: HandResult) -> float:
    r = hand.ranks
    match hand.category:
        case HandCategory.ROYAL_FLUSH:
            return 50 + r[0]
        case HandCategory.STRAIGHT_FLUSH:
            return 30 + r[0]
        case HandCategory.FOUR_OF_A_KIND:
            return 24 + r[0] * 2 + r[1]
        case HandCategory.FULL_HOUSE:
            return 18 + r[0] * 1.5 + r[1]
        case HandCategory.FLUSH:
            return 14 + sum(r) * 0.2
        case HandCategory.STRAIGHT:
            return 12 + r[0]
        case HandCategory.THREE_OF_A_KIND:
            return 8 + r[0] + sum(r[1:])
        case HandCategory.TWO_PAIR:
            return 5 + r[0] + r[1] * 0.5 + (r[2] if len(r) > 2 else 0)
        case HandCategory.ONE_PAIR:
            return 2 + r[0]
        case HandCategory.HIGH_CARD:
            return r[0]
    return 0.0


SCORING_V1 = ScoringRule("v1_draft", score_v1)


# --- v2: calibrated via Monte Carlo (see docs/scoring-design.*.md) ---
#
# Targets (50k trials, random legal fill):
#   - Per-line mean ≈ 11 → 12-line game total ≈ 132
#   - Tier gaps ~reflect 1/frequency; kickers use small fractional weights


def score_v2(hand: HandResult) -> float:
    r = hand.ranks
    match hand.category:
        case HandCategory.ROYAL_FLUSH:
            return 110
        case HandCategory.STRAIGHT_FLUSH:
            return 88 + r[0] * 0.15
        case HandCategory.FOUR_OF_A_KIND:
            return 68 + r[0] * 0.4 + r[1] * 0.08
        case HandCategory.FULL_HOUSE:
            return 50 + r[0] * 0.25 + r[1] * 0.12
        case HandCategory.FLUSH:
            return 40 + sum(r) * 0.04
        case HandCategory.STRAIGHT:
            return 34 + r[0] * 0.15
        case HandCategory.THREE_OF_A_KIND:
            return 24 + r[0] * 0.2 + sum(r[1:]) * 0.04
        case HandCategory.TWO_PAIR:
            return 17 + r[0] * 0.15 + r[1] * 0.08 + (r[2] * 0.04 if len(r) > 2 else 0)
        case HandCategory.ONE_PAIR:
            return 11 + r[0] * 0.12 + sum(r[1:]) * 0.03
        case HandCategory.HIGH_CARD:
            return 5 + r[0] * 0.08 + sum(r[1:3]) * 0.015
    return 0.0


SCORING_V2 = ScoringRule("v2_calibrated", score_v2)


# --- v3: probability-tier bases with readable integers (see docs/scoring-design.*.md) ---
#
# Targets (20k trials, random legal fill):
#   - Per-line mean ≈ 10.7 → 12-line game total ≈ 128
#   - Bases ~inverse rarity; kickers use 0.05–0.5 (one decimal)


def score_v3(hand: HandResult) -> float:
    r = hand.ranks
    match hand.category:
        case HandCategory.ROYAL_FLUSH:
            return 100
        case HandCategory.STRAIGHT_FLUSH:
            return 92 + r[0] * 0.1
        case HandCategory.FOUR_OF_A_KIND:
            return 78 + r[0] * 0.5 + r[1] * 0.1
        case HandCategory.FULL_HOUSE:
            return 62 + r[0] * 0.2 + r[1] * 0.1
        case HandCategory.FLUSH:
            return 52 + sum(r) * 0.05
        case HandCategory.STRAIGHT:
            return 45 + r[0] * 0.1
        case HandCategory.THREE_OF_A_KIND:
            return 28 + r[0] * 0.2 + sum(r[1:]) * 0.05
        case HandCategory.TWO_PAIR:
            return 18 + r[0] * 0.1 + r[1] * 0.1 + (r[2] * 0.05 if len(r) > 2 else 0)
        case HandCategory.ONE_PAIR:
            return 10 + r[0] * 0.1 + sum(r[1:]) * 0.05
        case HandCategory.HIGH_CARD:
            return 5 + r[0] * 0.1 + sum(r[1:3]) * 0.05
    return 0.0


SCORING_V3 = ScoringRule("v3_readable", score_v3)


# --- v4: steeper premium tiers (see docs/scoring-design.*.md) ---
#
# Lower common-tier bases; straight+ use wider jumps for jackpot feel.
# Targets (~20k trials): mean ~132–138, stdev ~22–26.


def score_v4(hand: HandResult) -> float:
    r = hand.ranks
    match hand.category:
        case HandCategory.ROYAL_FLUSH:
            return 200
        case HandCategory.STRAIGHT_FLUSH:
            return 165 + r[0] * 0.1
        case HandCategory.FOUR_OF_A_KIND:
            return 130 + r[0] * 0.5 + r[1] * 0.1
        case HandCategory.FULL_HOUSE:
            return 98 + r[0] * 0.2 + r[1] * 0.1
        case HandCategory.FLUSH:
            return 78 + sum(r) * 0.05
        case HandCategory.STRAIGHT:
            return 62 + r[0] * 0.1
        case HandCategory.THREE_OF_A_KIND:
            return 24 + r[0] * 0.2 + sum(r[1:]) * 0.05
        case HandCategory.TWO_PAIR:
            return 16 + r[0] * 0.1 + r[1] * 0.1 + (r[2] * 0.05 if len(r) > 2 else 0)
        case HandCategory.ONE_PAIR:
            return 9 + r[0] * 0.1 + sum(r[1:]) * 0.05
        case HandCategory.HIGH_CARD:
            return 4 + r[0] * 0.1 + sum(r[1:3]) * 0.05
    return 0.0


SCORING_V4 = ScoringRule("v4_premium_tiers", score_v4)

DEFAULT_SCORING = SCORING_V4


def score_line(cards: list, rule: ScoringRule = DEFAULT_SCORING) -> tuple[HandResult, float]:
    from quintet.hand import evaluate_five

    hand = evaluate_five(cards)
    return hand, rule.score(hand)


def score_grid(grid, rule: ScoringRule = DEFAULT_SCORING) -> dict:
    from quintet.grid import LINES

    breakdown: list[dict] = []
    total = 0.0
    for line_id, positions in LINES:
        cards = grid.line_cards(positions)
        hand, pts = score_line(cards, rule)
        total += pts
        breakdown.append(
            {
                "line": line_id,
                "hand": hand.name,
                "points": round_score(pts),
                "cards": [str(c) for c in cards],
            }
        )
    return {"total": round_score(total), "lines": breakdown}
