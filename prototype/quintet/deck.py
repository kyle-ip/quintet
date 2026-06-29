"""Deck operations."""

from __future__ import annotations

import random
from dataclasses import dataclass, field

from quintet.card import Card, Rank, Suit


def standard_deck() -> list[Card]:
    return [Card(rank=r, suit=s) for s in Suit for r in Rank]


@dataclass
class Deck:
    cards: list[Card] = field(default_factory=standard_deck)

    def shuffle(self, rng: random.Random | None = None) -> None:
        rng = rng or random.Random()
        rng.shuffle(self.cards)

    def draw(self, n: int = 1) -> list[Card]:
        if n > len(self.cards):
            raise ValueError(f"Cannot draw {n} cards; only {len(self.cards)} remain")
        drawn = self.cards[:n]
        self.cards = self.cards[n:]
        return drawn

    def __len__(self) -> int:
        return len(self.cards)
