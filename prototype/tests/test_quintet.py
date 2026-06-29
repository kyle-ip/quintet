"""Tests for Quintet core logic."""

from __future__ import annotations

import random

import pytest

from quintet.ai import choose_action, playout_solo_greedy
from quintet.card import Card
from quintet.game import SoloGame
from quintet.grid import Grid, LINES
from quintet.hand import HandCategory, evaluate_five
from quintet.scoring import SCORING_V1, SCORING_V2, SCORING_V3, SCORING_V4
from quintet.simulate import run_simulation
from quintet.two_player import TwoPlayerGame, resolve_match


def C(rank: str, suit: str) -> Card:
    return Card.from_str(rank + suit)


class TestHandEvaluation:
    def test_royal_flush(self):
        cards = [C("A", "S"), C("K", "S"), C("Q", "S"), C("J", "S"), C("10", "S")]
        assert evaluate_five(cards).category == HandCategory.ROYAL_FLUSH

    def test_wheel_straight(self):
        cards = [C("A", "H"), C("2", "D"), C("3", "C"), C("4", "S"), C("5", "H")]
        hand = evaluate_five(cards)
        assert hand.category == HandCategory.STRAIGHT
        assert hand.ranks == (5,)

    def test_full_house(self):
        cards = [C("K", "H"), C("K", "D"), C("K", "C"), C("2", "S"), C("2", "H")]
        assert evaluate_five(cards).category == HandCategory.FULL_HOUSE


class TestGrid:
    def test_adjacency_first_free(self):
        g = Grid()
        assert len(g.legal_positions()) == 25

    def test_adjacency_after_place(self):
        g = Grid()
        g.place(2, 2, C("A", "S"))
        legal = g.legal_positions()
        assert (2, 2) not in legal
        assert (1, 2) in legal
        assert (3, 3) in legal
        assert (0, 0) not in legal

    def test_twelve_lines(self):
        assert len(LINES) == 12


class TestSoloGame:
    def test_full_game_auto(self):
        game = SoloGame(pool_size=2)
        game.start(random.Random(0))
        rng = random.Random(1)
        while not game.is_over():
            pi, row, col = rng.choice(game.legal_actions())
            game.play(pi, row, col)
        score = game.final_score()
        assert score["total"] > 0
        assert len(score["lines"]) == 12


class TestTwoPlayerGame:
    def test_full_two_player_game(self):
        game = TwoPlayerGame(pool_size=2)
        game.start(random.Random(0))
        rng = random.Random(1)
        while not game.is_over():
            pi, row, col = rng.choice(game.legal_actions())
            game.play(pi, row, col)
        s0, s1 = game.final_scores()
        assert s0["total"] > 0
        assert s1["total"] > 0
        assert game.turn == 50

    def test_alternating_first_player(self):
        g0 = TwoPlayerGame(pool_size=1, starting_player=0)
        g1 = TwoPlayerGame(pool_size=1, starting_player=1)
        assert g0.current_player == 0
        assert g1.current_player == 1


class TestMatch:
    def test_combined_total_winner(self):
        g1 = ({"total": 130}, {"total": 120})
        g2 = ({"total": 125}, {"total": 128})
        outcome = resolve_match(g1, g2)
        assert outcome.winner == 0
        assert outcome.combined_totals == (255, 248)

    def test_tie_break_premium_lines(self):
        lines_premium = [{"hand": "straight", "points": 34}] * 2 + [{"hand": "high_card", "points": 5}] * 10
        lines_basic = [{"hand": "one_pair", "points": 11}] * 12
        g1 = ({"total": 100, "lines": lines_premium}, {"total": 100, "lines": lines_basic})
        g2 = ({"total": 100, "lines": lines_basic}, {"total": 100, "lines": lines_basic})
        outcome = resolve_match(g1, g2)
        assert outcome.winner == 0
        assert outcome.tie_break == "premium_line_count"


class TestAI:
    def test_greedy_beats_random_on_average(self):
        from quintet.scoring import score_grid
        from quintet.simulate import _random_legal_fill

        greedy_scores = [playout_solo_greedy(pool_size=2, rng=random.Random(i)) for i in range(200)]
        random_scores = []
        for i in range(200):
            grid = _random_legal_fill(random.Random(i))
            random_scores.append(score_grid(grid)["total"])
        assert sum(greedy_scores) / len(greedy_scores) > sum(random_scores) / len(random_scores)

    def test_choose_action_returns_legal(self):
        game = SoloGame(pool_size=2)
        game.start(random.Random(0))
        action = choose_action(game.legal_actions(), game.grid, game.pool)
        assert action in game.legal_actions()


class TestSimulation:
    def test_v4_mean_in_range(self):
        stats = run_simulation(trials=5000, seed=0, rule=SCORING_V4)
        assert 110 <= stats.game_total_mean <= 125
        assert 9.0 <= stats.per_line_score_mean <= 10.5

    def test_v4_higher_ceiling_than_v3(self):
        v3 = run_simulation(trials=2000, seed=1, rule=SCORING_V3)
        v4 = run_simulation(trials=2000, seed=1, rule=SCORING_V4)
        assert v4.game_total_max > v3.game_total_max

    def test_v3_mean_in_range(self):
        stats = run_simulation(trials=5000, seed=0, rule=SCORING_V3)
        assert 120 <= stats.game_total_mean <= 140
        assert 9.5 <= stats.per_line_score_mean <= 12.5

    def test_v2_mean_in_range(self):
        stats = run_simulation(trials=5000, seed=0, rule=SCORING_V2)
        assert 120 <= stats.game_total_mean <= 145
        assert 9.5 <= stats.per_line_score_mean <= 12.5

    def test_v1_higher_than_v2_mean(self):
        v1 = run_simulation(trials=2000, seed=1, rule=SCORING_V1)
        v2 = run_simulation(trials=2000, seed=1, rule=SCORING_V2)
        assert v1.game_total_mean > v2.game_total_mean * 1.1
