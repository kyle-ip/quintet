"""Greedy heuristic AI for card selection and placement."""

from __future__ import annotations

import random
from collections import Counter

from quintet.card import Card
from quintet.grid import LINES, Grid
from quintet.scoring import ScoringRule, DEFAULT_SCORING, score_line


def partial_line_value(cards: list[Card], rule: ScoringRule = DEFAULT_SCORING) -> float:
    """Estimate value of an incomplete or complete scoring line."""
    if not cards:
        return 0.0
    if len(cards) == 5:
        return score_line(cards, rule)[1]

    rank_counts = Counter(c.rank.value for c in cards)
    suit_counts = Counter(c.suit for c in cards)
    value = sum(c.rank.value for c in cards) * 0.08

    for count in rank_counts.values():
        if count >= 2:
            value += count * 4.5
        if count >= 3:
            value += 8.0

    for count in suit_counts.values():
        if count >= 3:
            value += count * 3.0
        if count >= 4:
            value += 6.0

    return value


def placement_value(
    grid: Grid,
    card: Card,
    row: int,
    col: int,
    rule: ScoringRule = DEFAULT_SCORING,
) -> float:
    """Score placing `card` at (row, col) on `grid`."""
    total = 0.0
    for _, positions in LINES:
        if (row, col) not in positions:
            continue
        existing = [
            grid.get(r, c)
            for r, c in positions
            if grid.get(r, c) is not None
        ]
        total += partial_line_value(existing + [card], rule)
    return total


def action_value(
    grid: Grid,
    opponent_grid: Grid | None,
    pool_index: int,
    row: int,
    col: int,
    pool: list[Card],
    rule: ScoringRule = DEFAULT_SCORING,
    deny_weight: float = 0.25,
) -> float:
    """Evaluate a pick-and-place action; optionally penalize cards the opponent wants."""
    card = pool[pool_index]
    own = placement_value(grid, card, row, col, rule)
    if opponent_grid is None:
        return own

    # Estimate opponent benefit if they received this card next turn
    opp_best = 0.0
    for o_row, o_col in opponent_grid.legal_positions():
        opp_best = max(opp_best, placement_value(opponent_grid, card, o_row, o_col, rule))
    return own - deny_weight * opp_best


def choose_action(
    legal_actions: list[tuple[int, int, int]],
    grid: Grid,
    pool: list[Card],
    opponent_grid: Grid | None = None,
    rule: ScoringRule = DEFAULT_SCORING,
    rng: random.Random | None = None,
) -> tuple[int, int, int]:
    """Pick the highest-value legal action; tie-break randomly."""
    rng = rng or random.Random()
    if not legal_actions:
        raise ValueError("No legal actions")

    best_score = float("-inf")
    best: list[tuple[int, int, int]] = []
    for pi, row, col in legal_actions:
        val = action_value(grid, opponent_grid, pi, row, col, pool, rule)
        if val > best_score:
            best_score = val
            best = [(pi, row, col)]
        elif val == best_score:
            best.append((pi, row, col))
    return rng.choice(best)


def playout_solo_greedy(
    pool_size: int = 2,
    rule: ScoringRule = DEFAULT_SCORING,
    rng: random.Random | None = None,
) -> float:
    """Fill a solo board using greedy AI; return final score."""
    from quintet.game import SoloGame

    rng = rng or random.Random()
    game = SoloGame(pool_size=pool_size, scoring=rule)
    game.start(rng)

    while not game.is_over():
        action = choose_action(game.legal_actions(), game.grid, game.pool, rule=rule, rng=rng)
        game.play(*action)
    return game.final_score()["total"]


def playout_two_player_greedy_vs_random(
    pool_size: int = 2,
    greedy_player: int = 0,
    rule: ScoringRule = DEFAULT_SCORING,
    rng: random.Random | None = None,
) -> tuple[float, float]:
    """One greedy player vs one random player; return final scores."""
    from quintet.two_player import TwoPlayerGame

    rng = rng or random.Random()
    game = TwoPlayerGame(pool_size=pool_size, scoring=rule)
    game.start(rng)

    while not game.is_over():
        player = game.current_player
        actions = game.legal_actions()
        if player == greedy_player:
            action = choose_action(
                actions,
                game.grids[player],
                game.pool,
                opponent_grid=game.grids[1 - player],
                rule=rule,
                rng=rng,
            )
        else:
            action = rng.choice(actions)
        game.play(*action)

    s0, s1 = game.final_scores()
    return s0["total"], s1["total"]
