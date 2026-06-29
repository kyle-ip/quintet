"""Interactive CLI prototype (solo, local two-player, and match modes)."""

from __future__ import annotations

import argparse
import random
import sys

from quintet.ai import choose_action
from quintet.card import Card
from quintet.game import POOL_SIZE_MAX, POOL_SIZE_MIN, SoloGame
from quintet.scoring import SCORING_V1, SCORING_V2, SCORING_V3, SCORING_V4, ScoringRule
from quintet.two_player import MatchOutcome, TwoPlayerGame, resolve_match


def _print_pool(pool: list[Card]) -> None:
    print("Pool:")
    for i, card in enumerate(pool):
        print(f"  [{i}] {card}")


def _print_help(mode: str) -> None:
    print("Commands: place <pool_idx> <row> <col> | auto | help | quit")
    print("  row/col: 0–4  |  auto: random legal move")
    if mode == "versus":
        print("  ai: greedy bot move (current player only)")
    print("  board <0|1>: show player grid in versus/match")


def _pick_scoring() -> ScoringRule:
    print("Scoring: [1] v4 premium (default)  [2] v3 readable  [3] v2 calibrated  [4] v1 draft")
    choice = input("> ").strip()
    if choice == "4":
        return SCORING_V1
    if choice == "3":
        return SCORING_V2
    if choice == "2":
        return SCORING_V3
    return SCORING_V4


def _pick_k(default: int = 2) -> int:
    k_str = input(f"Pool size k ({POOL_SIZE_MIN}–{POOL_SIZE_MAX}) [{default}]: ").strip() or str(default)
    try:
        k = int(k_str)
    except ValueError:
        raise ValueError("Invalid pool size") from None
    if not POOL_SIZE_MIN <= k <= POOL_SIZE_MAX:
        raise ValueError(f"Pool size must be {POOL_SIZE_MIN}–{POOL_SIZE_MAX}")
    return k


def _print_score_breakdown(result: dict, label: str) -> None:
    print(f"\n{label}: {result['total']}")
    for line in result["lines"]:
        cards = " ".join(line["cards"])
        print(f"  {line['line']:12s} {line['hand']:18s} {line['points']:6.1f}  [{cards}]")


def _run_solo(k: int, scoring: ScoringRule, rng: random.Random) -> None:
    game = SoloGame(pool_size=k, scoring=scoring)
    game.start(rng)
    print(f"\nScoring rule: {scoring.name}\n")
    _print_help("solo")

    while not game.is_over():
        print(f"\n--- Turn {game.turn + 1}/25 | Deck remaining: {len(game.deck)} ---")
        print(game.grid.render())
        _print_pool(game.pool)

        cmd = input("\n> ").strip().lower()
        if cmd in ("q", "quit", "exit"):
            print("Goodbye.")
            return
        if cmd == "help":
            _print_help("solo")
            continue
        if cmd == "auto":
            actions = game.legal_actions()
            if not actions:
                print("No legal moves.")
                continue
            pi, row, col = rng.choice(actions)
            card = game.play(pi, row, col)
            print(f"Auto: {card} -> ({row},{col})")
            continue

        parts = cmd.split()
        if parts[0] == "place" and len(parts) == 4:
            try:
                pi, row, col = int(parts[1]), int(parts[2]), int(parts[3])
                card = game.play(pi, row, col)
                print(f"Placed: {card} -> ({row},{col})")
            except (ValueError, IndexError) as e:
                print(f"Error: {e}")
            continue

        print("Unknown command. Type help.")

    print("\n=== Final ===")
    print(game.grid.render())
    _print_score_breakdown(game.final_score(), "Total")


def _versus_turn(
    game: TwoPlayerGame,
    rng: random.Random,
    player_names: tuple[str, str],
) -> None:
    player = game.current_player
    print(
        f"\n--- Turn {game.turn + 1}/50 | "
        f"{player_names[player]} | Deck: {len(game.deck)} ---"
    )
    print(f"\n[{player_names[0]} board]")
    print(game.grids[0].render())
    print(f"\n[{player_names[1]} board]")
    print(game.grids[1].render())
    _print_pool(game.pool)

    cmd = input(f"\n{player_names[player]}> ").strip().lower()
    if cmd in ("q", "quit", "exit"):
        raise KeyboardInterrupt
    if cmd == "help":
        _print_help("versus")
        return
    if cmd == "auto":
        actions = game.legal_actions()
        pi, row, col = rng.choice(actions)
        card = game.play(pi, row, col)
        print(f"Auto: {card} -> ({row},{col})")
        return
    if cmd == "ai":
        actions = game.legal_actions()
        pi, row, col = choose_action(
            actions,
            game.grids[player],
            game.pool,
            opponent_grid=game.grids[1 - player],
            rng=rng,
        )
        card = game.play(pi, row, col)
        print(f"AI: {card} -> ({row},{col})")
        return

    parts = cmd.split()
    if parts[0] == "board" and len(parts) == 2:
        idx = int(parts[1])
        print(game.grids[idx].render())
        return
    if parts[0] == "place" and len(parts) == 4:
        pi, row, col = int(parts[1]), int(parts[2]), int(parts[3])
        card = game.play(pi, row, col)
        print(f"Placed: {card} -> ({row},{col})")
        return

    print("Unknown command. Type help.")


def _run_versus(k: int, scoring: ScoringRule, rng: random.Random) -> tuple[dict, dict]:
    game = TwoPlayerGame(pool_size=k, scoring=scoring, starting_player=0)
    game.start(rng)
    names = ("Player 1", "Player 2")
    print(f"\nScoring rule: {scoring.name}")
    print("Shared deck and pool. Boards are visible to both players.\n")
    _print_help("versus")

    while not game.is_over():
        try:
            _versus_turn(game, rng, names)
        except KeyboardInterrupt:
            print("\nGoodbye.")
            sys.exit(0)

    print("\n=== Final ===")
    s0, s1 = game.final_scores()
    _print_score_breakdown(s0, names[0])
    _print_score_breakdown(s1, names[1])
    if s0["total"] > s1["total"]:
        print(f"\nWinner: {names[0]}")
    elif s1["total"] > s0["total"]:
        print(f"\nWinner: {names[1]}")
    else:
        print("\nSingle game tied (use match mode for tie-break rules).")
    return s0, s1


def _run_match(k: int, scoring: ScoringRule, rng: random.Random) -> MatchOutcome:
    results: list[tuple[dict, dict]] = []
    starters = (0, 1)
    names = ("Player 1", "Player 2")

    for game_num, starter in enumerate(starters, start=1):
        print(f"\n========== Game {game_num}/2 | {names[starter]} goes first ==========")
        game = TwoPlayerGame(pool_size=k, scoring=scoring, starting_player=starter)
        game.start(rng)
        _print_help("versus")

        while not game.is_over():
            try:
                _versus_turn(game, rng, names)
            except KeyboardInterrupt:
                print("\nGoodbye.")
                sys.exit(0)

        s0, s1 = game.final_scores()
        results.append((s0, s1))
        print(f"\nGame {game_num} totals: {names[0]}={s0['total']}  {names[1]}={s1['total']}")

    outcome = resolve_match(results[0], results[1])
    g1, g2 = outcome.game_totals
    print("\n========== Match result ==========")
    print(f"Game 1: P1={g1[0]}  P2={g1[1]}")
    print(f"Game 2: P1={g2[0]}  P2={g2[1]}")
    print(f"Combined: P1={outcome.combined_totals[0]}  P2={outcome.combined_totals[1]}")
    if outcome.winner is None:
        print("Match tied." + (f" ({outcome.tie_break})" if outcome.tie_break else ""))
    else:
        reason = f" ({outcome.tie_break})" if outcome.tie_break else ""
        print(f"Winner: {names[outcome.winner]}{reason}")
    return outcome


def main() -> None:
    parser = argparse.ArgumentParser(description="Quintet interactive prototype")
    parser.add_argument(
        "--mode",
        choices=("solo", "versus", "match"),
        help="solo | versus (single game) | match (two games, alternating first)",
    )
    parser.add_argument("-k", "--pool-size", type=int, choices=tuple(range(POOL_SIZE_MIN, POOL_SIZE_MAX + 1)))
    parser.add_argument("--scoring", choices=("v1", "v2", "v3", "v4"), default="v4")
    args = parser.parse_args()

    print("=== Quintet Prototype ===\n")
    rng = random.Random()

    mode = args.mode or input("Mode [solo/versus/match] [solo]: ").strip().lower() or "solo"
    if mode not in ("solo", "versus", "match"):
        print("Invalid mode.")
        sys.exit(1)

    scoring = (
        SCORING_V1
        if args.scoring == "v1"
        else SCORING_V2
        if args.scoring == "v2"
        else SCORING_V3
        if args.scoring == "v3"
        else SCORING_V4
    )
    if args.pool_size is None and args.mode is None:
        try:
            k = _pick_k()
        except ValueError as e:
            print(e)
            sys.exit(1)
        scoring = _pick_scoring()
    else:
        k = args.pool_size or 2

    if mode == "solo":
        _run_solo(k, scoring, rng)
    elif mode == "versus":
        _run_versus(k, scoring, rng)
    else:
        _run_match(k, scoring, rng)


if __name__ == "__main__":
    main()
