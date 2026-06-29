"""Solo game state machine."""

from __future__ import annotations

import random
from dataclasses import dataclass, field

from quintet.card import Card
from quintet.deck import Deck
from quintet.grid import Grid
from quintet.scoring import ScoringRule, DEFAULT_SCORING, score_grid

POOL_SIZE_MIN = 1
POOL_SIZE_MAX = 5


@dataclass
class SoloGame:
    pool_size: int
    deck: Deck = field(default_factory=Deck)
    pool: list[Card] = field(default_factory=list)
    grid: Grid = field(default_factory=Grid)
    scoring: ScoringRule = DEFAULT_SCORING
    turn: int = 0

    def __post_init__(self) -> None:
        if not POOL_SIZE_MIN <= self.pool_size <= POOL_SIZE_MAX:
            raise ValueError(f"pool_size must be {POOL_SIZE_MIN}–{POOL_SIZE_MAX}")

    def start(self, rng: random.Random | None = None) -> None:
        rng = rng or random.Random()
        self.deck.shuffle(rng)
        self.pool = []
        self.grid = Grid()
        self.turn = 0
        self._refill_pool()

    def _refill_pool(self) -> None:
        needed = self.pool_size - len(self.pool)
        if needed <= 0 or len(self.deck) == 0:
            return
        draw_count = min(needed, len(self.deck))
        self.pool.extend(self.deck.draw(draw_count))

    def legal_actions(self) -> list[tuple[int, int, int]]:
        """Returns list of (pool_index, row, col)."""
        positions = self.grid.legal_positions()
        actions: list[tuple[int, int, int]] = []
        for pi in range(len(self.pool)):
            for row, col in positions:
                actions.append((pi, row, col))
        return actions

    def play(self, pool_index: int, row: int, col: int) -> Card:
        if self.grid.is_full():
            raise ValueError("Grid is full")
        if pool_index < 0 or pool_index >= len(self.pool):
            raise ValueError("Invalid pool index")
        card = self.pool.pop(pool_index)
        self.grid.place(row, col, card)
        self.turn += 1
        if len(self.pool) == 0 and not self.grid.is_full():
            self._refill_pool()
        return card

    def is_over(self) -> bool:
        return self.grid.is_full()

    def final_score(self) -> dict:
        if not self.is_over():
            raise ValueError("Game not finished")
        return score_grid(self.grid, self.scoring)
