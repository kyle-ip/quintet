"""Texas Hold'em-style five-card hand evaluation."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from enum import IntEnum

from quintet.card import Card, Rank


class HandCategory(IntEnum):
    HIGH_CARD = 0
    ONE_PAIR = 1
    TWO_PAIR = 2
    THREE_OF_A_KIND = 3
    STRAIGHT = 4
    FLUSH = 5
    FULL_HOUSE = 6
    FOUR_OF_A_KIND = 7
    STRAIGHT_FLUSH = 8
    ROYAL_FLUSH = 9


CATEGORY_NAMES = {
    HandCategory.HIGH_CARD: "high_card",
    HandCategory.ONE_PAIR: "one_pair",
    HandCategory.TWO_PAIR: "two_pair",
    HandCategory.THREE_OF_A_KIND: "three_of_a_kind",
    HandCategory.STRAIGHT: "straight",
    HandCategory.FLUSH: "flush",
    HandCategory.FULL_HOUSE: "full_house",
    HandCategory.FOUR_OF_A_KIND: "four_of_a_kind",
    HandCategory.STRAIGHT_FLUSH: "straight_flush",
    HandCategory.ROYAL_FLUSH: "royal_flush",
}


@dataclass(frozen=True, slots=True)
class HandResult:
    category: HandCategory
    ranks: tuple[int, ...]  # tie-breaker ranks, high to low

    @property
    def name(self) -> str:
        return CATEGORY_NAMES[self.category]


def _straight_high(ranks: list[int]) -> int | None:
    unique = sorted(set(ranks), reverse=True)
    if len(unique) != 5:
        return None
    if unique[0] - unique[4] == 4:
        return unique[0]
    # Wheel: A-2-3-4-5
    if unique == [14, 5, 4, 3, 2]:
        return 5
    return None


def evaluate_five(cards: list[Card]) -> HandResult:
    if len(cards) != 5:
        raise ValueError("Exactly five cards required")

    ranks = [c.rank.value for c in cards]
    suits = [c.suit for c in cards]
    counts = Counter(ranks)
    ordered = sorted(counts.items(), key=lambda x: (x[1], x[0]), reverse=True)

    is_flush = len(set(suits)) == 1
    straight_high = _straight_high(ranks)

    if is_flush and straight_high == 14:
        return HandResult(HandCategory.ROYAL_FLUSH, (14,))
    if is_flush and straight_high is not None:
        return HandResult(HandCategory.STRAIGHT_FLUSH, (straight_high,))

    pattern = sorted(counts.values(), reverse=True)

    if pattern == [4, 1]:
        quad = max(r for r, c in counts.items() if c == 4)
        kicker = max(r for r, c in counts.items() if c == 1)
        return HandResult(HandCategory.FOUR_OF_A_KIND, (quad, kicker))
    if pattern == [3, 2]:
        trips = max(r for r, c in counts.items() if c == 3)
        pair = max(r for r, c in counts.items() if c == 2)
        return HandResult(HandCategory.FULL_HOUSE, (trips, pair))
    if is_flush:
        return HandResult(HandCategory.FLUSH, tuple(sorted(ranks, reverse=True)))
    if straight_high is not None:
        return HandResult(HandCategory.STRAIGHT, (straight_high,))
    if pattern == [3, 1, 1]:
        trips = max(r for r, c in counts.items() if c == 3)
        kickers = sorted((r for r, c in counts.items() if c == 1), reverse=True)
        return HandResult(HandCategory.THREE_OF_A_KIND, (trips, *kickers))
    if pattern == [2, 2, 1]:
        pairs = sorted((r for r, c in counts.items() if c == 2), reverse=True)
        kicker = max(r for r, c in counts.items() if c == 1)
        return HandResult(HandCategory.TWO_PAIR, (pairs[0], pairs[1], kicker))
    if pattern == [2, 1, 1, 1]:
        pair = max(r for r, c in counts.items() if c == 2)
        kickers = sorted((r for r, c in counts.items() if c == 1), reverse=True)
        return HandResult(HandCategory.ONE_PAIR, (pair, *kickers))

    return HandResult(HandCategory.HIGH_CARD, tuple(sorted(ranks, reverse=True)))
