"""Monte Carlo scoring simulation."""

from __future__ import annotations

import random
import statistics
from collections import Counter
from dataclasses import dataclass

from quintet.deck import Deck
from quintet.grid import Grid, SIZE
from quintet.scoring import SCORING_V1, SCORING_V2, SCORING_V3, SCORING_V4, ScoringRule, score_grid


def _random_legal_fill(rng: random.Random) -> Grid:
    deck = Deck()
    deck.shuffle(rng)
    cards = deck.draw(25)
    grid = Grid()
    sr, sc = rng.randint(0, SIZE - 1), rng.randint(0, SIZE - 1)
    grid.place(sr, sc, cards[0])
    for card in cards[1:]:
        row, col = rng.choice(grid.legal_positions())
        grid.place(row, col, card)
    return grid


@dataclass
class SimStats:
    trials: int
    per_line_category_freq: dict[str, float]
    per_line_score_mean: float
    per_line_score_stdev: float
    game_total_mean: float
    game_total_stdev: float
    game_total_p95: float
    game_total_max: float
    category_counts: dict[str, int]


def run_simulation(
    trials: int = 50_000,
    seed: int = 42,
    rule: ScoringRule = SCORING_V4,
) -> SimStats:
    rng = random.Random(seed)
    line_scores: list[float] = []
    game_totals: list[float] = []
    category_counter: Counter[str] = Counter()

    for _ in range(trials):
        grid = _random_legal_fill(rng)
        result = score_grid(grid, rule)
        game_totals.append(result["total"])
        for line in result["lines"]:
            line_scores.append(line["points"])
            category_counter[line["hand"]] += 1

    total_line_samples = trials * 12
    freq = {k: v / total_line_samples for k, v in sorted(category_counter.items())}

    sorted_totals = sorted(game_totals)
    p95_idx = max(0, int(trials * 0.95) - 1)

    return SimStats(
        trials=trials,
        per_line_category_freq=freq,
        per_line_score_mean=statistics.mean(line_scores),
        per_line_score_stdev=statistics.stdev(line_scores),
        game_total_mean=statistics.mean(game_totals),
        game_total_stdev=statistics.stdev(game_totals),
        game_total_p95=sorted_totals[p95_idx],
        game_total_max=max(game_totals),
        category_counts=dict(category_counter),
    )


def compare_v3_v4(trials: int = 20_000, seed: int = 42) -> None:
    """Compare v3 vs v4 game totals and premium-hand lift."""
    from quintet.scoring import SCORING_V3, SCORING_V4

    premium = {"straight", "flush", "full_house", "four_of_a_kind", "straight_flush", "royal_flush"}
    for rule in (SCORING_V3, SCORING_V4):
        stats = run_simulation(trials=trials, seed=seed, rule=rule)
        rng = random.Random(seed)
        with_straight: list[float] = []
        with_premium: list[float] = []
        for _ in range(trials):
            grid = _random_legal_fill(rng)
            result = score_grid(grid, rule)
            hands = {line["hand"] for line in result["lines"]}
            total = result["total"]
            if "straight" in hands:
                with_straight.append(total)
            if hands & premium:
                with_premium.append(total)
        print(f"\n=== {rule.name} ({trials:,} trials) ===")
        print(f"Game total: mean={stats.game_total_mean:.1f}  stdev={stats.game_total_stdev:.1f}")
        print(f"            p95={stats.game_total_p95:.1f}  max={stats.game_total_max:.1f}")
        if with_straight:
            print(f"With ≥1 straight: mean={statistics.mean(with_straight):.1f}  (n={len(with_straight)})")
        if with_premium:
            print(f"With ≥1 premium: mean={statistics.mean(with_premium):.1f}  (n={len(with_premium)})")


def compare_rules(trials: int = 50_000, seed: int = 42) -> None:
    from quintet.scoring import SCORING_V3, SCORING_V4

    for rule in (SCORING_V3, SCORING_V4):
        stats = run_simulation(trials=trials, seed=seed, rule=rule)
        print(f"\n=== {rule.name} ({trials:,} trials) ===")
        print(f"Game total: mean={stats.game_total_mean:.2f}  stdev={stats.game_total_stdev:.2f}")
        print(f"            p95={stats.game_total_p95:.2f}  max={stats.game_total_max:.2f}")
        print(f"Per line:   mean={stats.per_line_score_mean:.2f}  stdev={stats.per_line_score_stdev:.2f}")
        print("Category frequency (per line):")
        for name, pct in sorted(stats.per_line_category_freq.items(), key=lambda x: -x[1]):
            print(f"  {name:20s} {pct * 100:5.2f}%")


def compare_greedy(trials: int = 5_000, seed: int = 42) -> None:
    """Compare random vs greedy solo play."""
    from quintet.ai import playout_solo_greedy, playout_two_player_greedy_vs_random

    random_totals: list[float] = []
    r = random.Random(seed)
    for _ in range(trials):
        grid = _random_legal_fill(r)
        random_totals.append(score_grid(grid, SCORING_V4)["total"])

    greedy_totals = [
        playout_solo_greedy(pool_size=2, rng=random.Random(seed + i)) for i in range(trials)
    ]

    p0_wins = p1_wins = 0
    p0_totals: list[float] = []
    p1_totals: list[float] = []
    for i in range(trials):
        s0, s1 = playout_two_player_greedy_vs_random(
            pool_size=2, greedy_player=0, rng=random.Random(seed + i)
        )
        p0_totals.append(s0)
        p1_totals.append(s1)
        if s0 > s1:
            p0_wins += 1
        elif s1 > s0:
            p1_wins += 1

    print(f"\n=== Strategic simulation ({trials:,} trials, k=2, v4) ===")
    print("Solo random fill:")
    print(f"  mean={statistics.mean(random_totals):.2f}  max={max(random_totals):.2f}")
    print("Solo greedy AI:")
    print(f"  mean={statistics.mean(greedy_totals):.2f}  max={max(greedy_totals):.2f}")
    print("Two-player greedy P0 vs random P1:")
    print(f"  P0 mean={statistics.mean(p0_totals):.2f}  P1 mean={statistics.mean(p1_totals):.2f}")
    print(f"  P0 win rate={p0_wins / trials * 100:.1f}%")


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Quintet scoring Monte Carlo simulation")
    parser.add_argument("-n", "--trials", type=int, default=50_000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--compare", action="store_true", help="Compare v3 vs v4 scoring")
    parser.add_argument("--compare-v1-v2", action="store_true", help="Compare v1 vs v2 scoring")
    parser.add_argument("--greedy", action="store_true", help="Run greedy vs random strategic sim")
    args = parser.parse_args()

    if args.greedy:
        compare_greedy(trials=min(args.trials, 10_000), seed=args.seed)
    elif args.compare_v1_v2:
        from quintet.scoring import SCORING_V1, SCORING_V2

        for rule in (SCORING_V1, SCORING_V2):
            stats = run_simulation(trials=args.trials, seed=args.seed, rule=rule)
            print(f"\n=== {rule.name} ({args.trials:,} trials) ===")
            print(f"Game total: mean={stats.game_total_mean:.2f}  stdev={stats.game_total_stdev:.2f}")
            print(f"            p95={stats.game_total_p95:.2f}  max={stats.game_total_max:.2f}")
    elif args.compare:
        compare_v3_v4(trials=args.trials, seed=args.seed)
    else:
        compare_rules(trials=args.trials, seed=args.seed)


if __name__ == "__main__":
    main()
