"""Two-player game and match resolution."""

from __future__ import annotations

import random
from dataclasses import dataclass, field

from quintet.card import Card
from quintet.deck import Deck
from quintet.grid import Grid
from quintet.game import POOL_SIZE_MAX, POOL_SIZE_MIN
from quintet.scoring import ScoringRule, DEFAULT_SCORING, score_grid


@dataclass
class TwoPlayerGame:
    pool_size: int
    deck: Deck = field(default_factory=Deck)
    pool: list[Card] = field(default_factory=list)
    grids: list[Grid] = field(default_factory=lambda: [Grid(), Grid()])
    scoring: ScoringRule = DEFAULT_SCORING
    turn: int = 0
    starting_player: int = 0

    def __post_init__(self) -> None:
        if not POOL_SIZE_MIN <= self.pool_size <= POOL_SIZE_MAX:
            raise ValueError(f"pool_size must be {POOL_SIZE_MIN}–{POOL_SIZE_MAX}")
        if self.starting_player not in (0, 1):
            raise ValueError("starting_player must be 0 or 1")

    @property
    def current_player(self) -> int:
        return (self.starting_player + self.turn) % 2

    def start(self, rng: random.Random | None = None) -> None:
        rng = rng or random.Random()
        self.deck = Deck()
        self.deck.shuffle(rng)
        self.pool = []
        self.grids = [Grid(), Grid()]
        self.turn = 0
        self._refill_pool()

    def _refill_pool(self) -> None:
        needed = self.pool_size - len(self.pool)
        if needed <= 0 or len(self.deck) == 0:
            return
        draw_count = min(needed, len(self.deck))
        self.pool.extend(self.deck.draw(draw_count))

    def legal_actions(self, player: int | None = None) -> list[tuple[int, int, int]]:
        """Returns list of (pool_index, row, col) for the given player."""
        player = self.current_player if player is None else player
        grid = self.grids[player]
        positions = grid.legal_positions()
        return [(pi, row, col) for pi in range(len(self.pool)) for row, col in positions]

    def play(self, pool_index: int, row: int, col: int) -> Card:
        player = self.current_player
        grid = self.grids[player]
        if grid.is_full():
            raise ValueError(f"Player {player} grid is full")
        if pool_index < 0 or pool_index >= len(self.pool):
            raise ValueError("Invalid pool index")
        card = self.pool.pop(pool_index)
        grid.place(row, col, card)
        self.turn += 1
        if len(self.pool) == 0:
            self._refill_pool()
        return card

    def is_over(self) -> bool:
        return all(g.is_full() for g in self.grids)

    def player_score(self, player: int) -> dict:
        if not self.grids[player].is_full():
            raise ValueError(f"Player {player} grid is not full")
        return score_grid(self.grids[player], self.scoring)

    def final_scores(self) -> tuple[dict, dict]:
        if not self.is_over():
            raise ValueError("Game not finished")
        return self.player_score(0), self.player_score(1)


@dataclass(frozen=True, slots=True)
class MatchOutcome:
    combined_totals: tuple[float, float]
    game_totals: tuple[tuple[float, float], tuple[float, float]]
    winner: int | None
    tie_break: str | None = None


PREMIUM_HANDS = frozenset(
    {
        "straight",
        "flush",
        "full_house",
        "four_of_a_kind",
        "straight_flush",
        "royal_flush",
    }
)


def _premium_line_count(score_result: dict) -> int:
    return sum(1 for line in score_result["lines"] if line["hand"] in PREMIUM_HANDS)


def resolve_match(
    game1: tuple[dict, dict],
    game2: tuple[dict, dict],
) -> MatchOutcome:
    """
    Resolve a two-game match with alternating first player.

    Tie-break order:
    1. Higher combined total across both games
    2. Higher best single-game total
    3. More premium lines (straight or better) across both games
    4. Draw
    """
    g1_p0, g1_p1 = game1[0]["total"], game1[1]["total"]
    g2_p0, g2_p1 = game2[0]["total"], game2[1]["total"]
    combined = (g1_p0 + g2_p0, g1_p1 + g2_p1)

    if combined[0] > combined[1]:
        return MatchOutcome(combined, ((g1_p0, g1_p1), (g2_p0, g2_p1)), 0)
    if combined[1] > combined[0]:
        return MatchOutcome(combined, ((g1_p0, g1_p1), (g2_p0, g2_p1)), 1)

    best_single = (
        max(g1_p0, g2_p0),
        max(g1_p1, g2_p1),
    )
    if best_single[0] > best_single[1]:
        return MatchOutcome(
            combined,
            ((g1_p0, g1_p1), (g2_p0, g2_p1)),
            0,
            "best_single_game",
        )
    if best_single[1] > best_single[0]:
        return MatchOutcome(
            combined,
            ((g1_p0, g1_p1), (g2_p0, g2_p1)),
            1,
            "best_single_game",
        )

    premium = (
        _premium_line_count(game1[0]) + _premium_line_count(game2[0]),
        _premium_line_count(game1[1]) + _premium_line_count(game2[1]),
    )
    if premium[0] > premium[1]:
        return MatchOutcome(
            combined,
            ((g1_p0, g1_p1), (g2_p0, g2_p1)),
            0,
            "premium_line_count",
        )
    if premium[1] > premium[0]:
        return MatchOutcome(
            combined,
            ((g1_p0, g1_p1), (g2_p0, g2_p1)),
            1,
            "premium_line_count",
        )

    return MatchOutcome(combined, ((g1_p0, g1_p1), (g2_p0, g2_p1)), None, "draw")
